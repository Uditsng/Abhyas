export const downloadCSVTemplate = () => {
  const headers = [
    "Question",
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Correct Answer",
    "Explanation",
    "Marks",
  ];

  const csvContent = headers.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "question_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
