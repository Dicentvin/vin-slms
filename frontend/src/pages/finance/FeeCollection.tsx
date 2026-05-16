import { useState } from "react";
import { Printer, Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface FeeRecord {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  term: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "partial" | "unpaid";
  invoiceNo: string;
}

const mockFees: FeeRecord[] = [
  { id: "1", studentName: "Alice Johnson", studentId: "STU001", class: "Grade 10A", term: "Term 1 2024", amount: 150000, paid: 150000, balance: 0, dueDate: "2024-09-30", paidDate: "2024-09-15", status: "paid", invoiceNo: "INV-2024-001" },
  { id: "2", studentName: "Bob Martinez", studentId: "STU002", class: "Grade 10A", term: "Term 1 2024", amount: 150000, paid: 75000, balance: 75000, dueDate: "2024-09-30", status: "partial", invoiceNo: "INV-2024-002" },
  { id: "3", studentName: "Carol White", studentId: "STU003", class: "Grade 11A", term: "Term 1 2024", amount: 175000, paid: 0, balance: 175000, dueDate: "2024-09-30", status: "unpaid", invoiceNo: "INV-2024-003" },
  { id: "4", studentName: "David Lee", studentId: "STU004", class: "Grade 11A", term: "Term 1 2024", amount: 175000, paid: 175000, balance: 0, dueDate: "2024-09-30", paidDate: "2024-09-10", status: "paid", invoiceNo: "INV-2024-004" },
  { id: "5", studentName: "Eva Brown", studentId: "STU005", class: "Grade 9A", term: "Term 1 2024", amount: 120000, paid: 60000, balance: 60000, dueDate: "2024-09-30", status: "partial", invoiceNo: "INV-2024-005" },
  { id: "6", studentName: "Frank Wilson", studentId: "STU006", class: "Grade 10B", term: "Term 1 2024", amount: 150000, paid: 150000, balance: 0, dueDate: "2024-09-30", paidDate: "2024-09-20", status: "paid", invoiceNo: "INV-2024-006" },
];

const statusBadge = (status: FeeRecord["status"]) => {
  if (status === "paid") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle className="h-3 w-3" />Paid</Badge>;
  if (status === "partial") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><Clock className="h-3 w-3" />Partial</Badge>;
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><XCircle className="h-3 w-3" />Unpaid</Badge>;
};

const fmt = (n: number) => `₦${n.toLocaleString()}`;

const Invoice = ({ record, onClose }: { record: FeeRecord; onClose: () => void }) => {
  const handlePrint = () => window.print();
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Invoice — {record.invoiceNo}
            <Button size="sm" onClick={handlePrint} className="print:hidden">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="invoice-content" className="p-6 border rounded-lg space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">EduNexus School</h1>
              <p className="text-muted-foreground text-sm">123 School Road, Springfield</p>
              <p className="text-muted-foreground text-sm">admin@edunexus.edu | +234 800 000 0000</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">INVOICE</div>
              <div className="text-sm text-muted-foreground">{record.invoiceNo}</div>
              <div className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                record.status === "paid" ? "bg-green-100 text-green-700" :
                record.status === "partial" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {record.status.toUpperCase()}
              </div>
            </div>
          </div>

          <hr />

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bill To</div>
              <div className="font-semibold">{record.studentName}</div>
              <div className="text-sm text-muted-foreground">Student ID: {record.studentId}</div>
              <div className="text-sm text-muted-foreground">Class: {record.class}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invoice Details</div>
              <div className="text-sm"><span className="text-muted-foreground">Term:</span> {record.term}</div>
              <div className="text-sm"><span className="text-muted-foreground">Due Date:</span> {record.dueDate}</div>
              {record.paidDate && <div className="text-sm"><span className="text-muted-foreground">Paid Date:</span> {record.paidDate}</div>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">Description</th>
                <th className="text-right py-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">School Fees — {record.term}</td>
                <td className="py-3 text-right">{fmt(record.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-2 text-muted-foreground">Total</td>
                <td className="py-2 text-right font-semibold">{fmt(record.amount)}</td>
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Amount Paid</td>
                <td className="py-2 text-right text-green-600 font-semibold">{fmt(record.paid)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 font-bold">Balance Due</td>
                <td className={`py-2 text-right font-bold text-lg ${record.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {fmt(record.balance)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Thank you for your payment. For inquiries contact the school bursar.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function FeeCollection() {
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);

  const filtered = mockFees.filter(f =>
    f.studentName.toLowerCase().includes(search.toLowerCase()) ||
    f.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    f.class.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = mockFees.reduce((s, f) => s + f.paid, 0);
  const totalExpected = mockFees.reduce((s, f) => s + f.amount, 0);
  const totalBalance = mockFees.reduce((s, f) => s + f.balance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Collection</h1>
          <p className="text-muted-foreground">Manage student fee payments and generate invoices.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Expected</div>
          <div className="text-2xl font-bold mt-1">{fmt(totalExpected)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Collected</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{fmt(totalCollected)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Outstanding Balance</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{fmt(totalBalance)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search fees..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(fee => (
              <TableRow key={fee.id}>
                <TableCell className="font-mono text-xs">{fee.invoiceNo}</TableCell>
                <TableCell className="font-medium">{fee.studentName}</TableCell>
                <TableCell>{fee.class}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fee.term}</TableCell>
                <TableCell>{fmt(fee.amount)}</TableCell>
                <TableCell className="text-green-600">{fmt(fee.paid)}</TableCell>
                <TableCell className={fee.balance > 0 ? "text-red-600" : "text-green-600"}>{fmt(fee.balance)}</TableCell>
                <TableCell>{statusBadge(fee.status)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedRecord(fee)}>
                    <Printer className="h-3 w-3 mr-1" /> Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedRecord && (
        <Invoice record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
