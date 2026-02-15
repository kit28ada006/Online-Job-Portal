/**
 * Simple utility to convert array of objects to CSV string
 * @param {Array} data - Array of objects
 * @param {Array} headers - Optional array of header names
 * @returns {string} - CSV string
 */
export const convertToCSV = (data, headers) => {
    if (!data || !data.length) return "";

    const columnHeaders = headers || Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(columnHeaders.join(","));

    // Add data rows
    for (const row of data) {
        const values = columnHeaders.map((header) => {
            const val = row[header];
            const escaped = ("" + (val === undefined || val === null ? "" : val)).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
};
