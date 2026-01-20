import { google } from "googleapis";
import path from "path";

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "";
const CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || "./google-credentials.json";
const CREDENTIALS_JSON = process.env.GOOGLE_SHEETS_CREDENTIALS || "";

// Tab names
const LICENSED_TAB = "Licensed recruits";
const UNLICENSED_TAB = "Unlicensed";

// Column indices (0-based)
const COLUMNS = {
  FULL_NAME: 0,    // A
  PHONE: 1,        // B
  EMAIL: 2,        // C
  IG_HANDLE: 3,    // D
  AGE: 4,          // E
  LICENSE_STATUS: 5, // F
  SOLD_TO: 6,      // G
  DATE_SOLD: 7,    // H
  SYNCED: 8,       // I
  SOLD: 9,         // J
  ORDER_ID: 10,    // K
};

async function getGoogleSheetsClient() {
  let auth;

  // Prefer environment variable (for production), fall back to file (for local dev)
  if (CREDENTIALS_JSON) {
    const credentials = JSON.parse(CREDENTIALS_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  } else {
    auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.cwd(), CREDENTIALS_PATH),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }

  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client as any });
}

/**
 * Count available (not sold) recruits from a tab
 */
async function countAvailableInTab(tabName: string): Promise<number> {
  const sheets = await getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A:J`,
  });

  const rows = response.data.values || [];
  let count = 0;

  // Skip header row (index 0), start from row 1
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const soldValue = row[COLUMNS.SOLD]?.toString().toLowerCase().trim();
    const fullName = row[COLUMNS.FULL_NAME]?.toString() || "";

    // Skip if already sold or no name
    if (soldValue === "yes" || soldValue === "sold" || soldValue === "true") {
      continue;
    }
    if (!fullName) {
      continue;
    }

    count++;
  }

  return count;
}

/**
 * Get inventory counts from Google Sheets
 */
export async function getInventoryCounts(): Promise<{
  licensed: number;
  unlicensed: number;
}> {
  const [licensed, unlicensed] = await Promise.all([
    countAvailableInTab(LICENSED_TAB),
    countAvailableInTab(UNLICENSED_TAB),
  ]);

  return { licensed, unlicensed };
}

export interface SheetRecruit {
  rowIndex: number;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  igHandle: string;
}

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Get available recruits from Google Sheets (for purchases)
 */
export async function getAvailableRecruits(
  isLicensed: boolean,
  limit: number
): Promise<SheetRecruit[]> {
  const sheets = await getGoogleSheetsClient();
  const tabName = isLicensed ? LICENSED_TAB : UNLICENSED_TAB;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A:J`,
  });

  const rows = response.data.values || [];
  const recruits: SheetRecruit[] = [];

  // Skip header row (index 0), start from row 1
  for (let i = 1; i < rows.length && recruits.length < limit; i++) {
    const row = rows[i];
    const soldValue = row[COLUMNS.SOLD]?.toString().toLowerCase().trim();
    const fullName = row[COLUMNS.FULL_NAME]?.toString() || "";

    // Skip if already sold or no name
    if (soldValue === "yes" || soldValue === "sold" || soldValue === "true") {
      continue;
    }
    if (!fullName) {
      continue;
    }

    const { firstName, lastName } = parseFullName(fullName);

    recruits.push({
      rowIndex: i + 1, // Google Sheets uses 1-based indexing
      fullName,
      firstName,
      lastName,
      phone: row[COLUMNS.PHONE]?.toString() || "",
      email: row[COLUMNS.EMAIL]?.toString() || "",
      igHandle: row[COLUMNS.IG_HANDLE]?.toString() || "",
    });
  }

  return recruits;
}

/**
 * Mark recruits as sold in Google Sheets
 */
export async function markRecruitsAsSold(
  isLicensed: boolean,
  rowIndices: number[],
  soldTo: string
): Promise<void> {
  const tabName = isLicensed ? LICENSED_TAB : UNLICENSED_TAB;
  const now = new Date().toISOString().split("T")[0];

  // Need write scope for this
  let writeAuth;
  if (CREDENTIALS_JSON) {
    const credentials = JSON.parse(CREDENTIALS_JSON);
    writeAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } else {
    writeAuth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.cwd(), CREDENTIALS_PATH),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  const client = await writeAuth.getClient();
  const writeSheets = google.sheets({ version: "v4", auth: client as any });

  const data = rowIndices.flatMap((rowIndex) => [
    { range: `'${tabName}'!G${rowIndex}`, values: [[soldTo]] },
    { range: `'${tabName}'!H${rowIndex}`, values: [[now]] },
    { range: `'${tabName}'!J${rowIndex}`, values: [["Yes"]] },
  ]);

  await writeSheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data,
    },
  });
}
