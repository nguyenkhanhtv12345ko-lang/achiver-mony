
import { Transaction } from "../types";

export const exportToCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  // Header row
  const headers = ["Ngày", "Nội dung", "Loại", "Nguồn", "Số tiền (VND)"];
  
  // Data rows
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('vi-VN'),
    t.content.replace(/,/g, ' '), // Tránh lỗi dấu phẩy trong CSV
    t.type,
    t.source,
    t.amount
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  // Create blob with UTF-8 BOM for Excel compatibility with Vietnamese characters
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Trigger download
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Sao_Ke_Tai_Chinh_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
