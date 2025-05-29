interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

export const fetchSheetData = async (spreadsheetId: string, range: string): Promise<string[][]> => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data = response.result as SheetData;
    return data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};

export const parseSheetData = (data: string[][]) => {
  if (!data || data.length < 2) return [];

  const headers = data[0];
  return data.slice(1).map(row => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || '';
    });
    return item;
  });
}; 