import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DownloadComponent } from './download/download.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
   displayedColumns: string[] = ['login', 'id', 'type', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('https://api.github.com/users').subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }
 openDownloadDialog() {
    const dialogRef = this.dialog.open(DownloadComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'csv') {
        this.downloadCSV();
      } else if (result === 'pdf') {
        this.downloadPDF();
      }
    });
  }
getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
  downloadCSV() {
    const csvData = this.convertToCSV(this.dataSource.filteredData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const fileName = `users-${this.getTodayDate()}.csv`;
    saveAs(blob, fileName);
  }

  convertToCSV(data: any[]) {
    const headers = ['Login', 'ID', 'Type'];
    const rows = data.map(u => `${u.login},${u.id},${u.type}`);
    return [headers.join(','), ...rows].join('\n');
  }

   downloadPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Login', 'ID', 'Type']],
      body: this.dataSource.filteredData.map(u => [u.login, u.id.toString(), u.type])
    });
    doc.save('users.pdf');
  }

  printTable() {
  const printContent = this.generatePrintableHTML(this.dataSource.filteredData);
  const WindowPrt = window.open('', '', 'width=900,height=650');
  if (WindowPrt) {
    WindowPrt.document.write(printContent);
    WindowPrt.document.close();
    WindowPrt.focus();
    setTimeout(() => {
      WindowPrt.print();
      WindowPrt.close();
    }, 500);
  }
}

generatePrintableHTML(data: any[]): string {
  let html = `
    <html>
    <head>
      <title>Print Table</title>
      <style>
        table { width: 100%; border-collapse: collapse; font-family: Arial; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <h2>User Data</h2>
      <table>
        <thead>
          <tr>
            <th>Login</th>
            <th>ID</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
  `;
  data.forEach(user => {
    html += `
      <tr>
        <td>${user.login}</td>
        <td>${user.id}</td>
        <td>${user.type}</td>
      </tr>
    `;
  });
  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;
  return html;
}

printTable2() {
  const printContent = this.generatePrintableHTML(this.dataSource.filteredData);

  const popup = window.open('', '_blank', 'width=800,height=600');
  if (popup) {
    popup.document.open();
    popup.document.write(printContent);
    popup.document.close();

    // Use media query to auto-print on load (CSS-based approach)
    popup.document.body.onload = () => {
      popup.focus();
      popup.print(); // still needed, browsers do not auto-print without it
    };
  }
}
}
