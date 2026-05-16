import { useState } from "react";
import { Printer, Plus, Search } from "lucide-react";
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

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  approvedBy: string;
  receiptNo: string;
  description: string;
  status: "approved" | "pending" | "rejected";
}

const mockExpenses: Expense[] = [
  { id: "1", title: "Classroom Furniture", category: "Infrastructure", amount: 450000, date: "2025-03-05", approvedBy: "Admin User", receiptNo: "EXP-2025-001", description: "Purchase of 30 new chairs and desks for Grade 10A classroom.", status: "approved" },
  { id: "2", title: "Science Lab Equipment", category: "Equipment", amount: 380000, date: "2025-03-08", approvedBy: "Admin User", receiptNo: "EXP-2025-002", description: "Microscopes and chemistry lab materials.", status: "approved" },
  { id: "3", title: "School Bus Maintenance", category: "Transport", amount: 95000, date: "2025-03-12", approvedBy: "Admin User", receiptNo: "EXP-2025-003", description: "Routine servicing and brake replacement for school bus.", status: "approved" },
  { id: "4", title: "Office Supplies", category: "Administration", amount: 45000, date: "2025-03-15", approvedBy: "Admin User", receiptNo: "EXP-2025-004", description: "Stationery, printer ink, and paper for admin office.", status: "approved" },
  { id: "5", title: "Sports Equipment", category: "Sports", amount: 120000, date: "2025-03-18", approvedBy: "Pending", receiptNo: "EXP-2025-005", description: "Footballs, jerseys and cones for sports department.", status: "pending" },
  { id: "6", title: "Library Books", category: "Education", amount: 200000, date: "2025-03-20", approvedBy: "Admin User", receiptNo: "EXP-2025-006", description: "New textbooks and reference materials for school library.", status: "approved" },
];

const categoryColors: Record<string, string> = {
  Infrastructure: "bg-blue-100 text-blue-700",
  Equipment: "bg-purple-100 text-purple-700",
  Transport: "bg-orange-100 text-orange-700",
  Administration: "bg-gray-100 text-gray-700",
  Sports: "bg-green-100 text-green-700",
  Education: "bg-pink-100 text-pink-700",
};

const fmt = (n: number) => `₦${n.toLocaleString()}`;

const Receipt = ({ expense, onClose }: { expense: Expense; onClose: () => void }) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          Expense Receipt — {expense.receiptNo}
          <Button size="sm" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </DialogTitle>
      </DialogHeader>
      <div className="p-6 border rounded-lg space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">EduNexus School</h1>
            <p className="text-muted-foreground text-sm">123 School Road, Springfield</p>
            <p className="text-muted-foreground text-sm">admin@edunexus.edu</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">EXPENSE RECEIPT</div>
            <div className="text-sm text-muted-foreground">{expense.receiptNo}</div>
            <div className="text-sm text-muted-foreground">{expense.date}</div>
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Expense Details</div>
            <div className="font-semibold">{expense.title}</div>
            <div className="text-sm text-muted-foreground">Category: {expense.category}</div>
            <div className="text-sm text-muted-foreground">Date: {expense.date}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Approval</div>
            <div className="text-sm"><span className="text-muted-foreground">Approved By:</span> {expense.approvedBy}</div>
            <div className="text-sm"><span className="text-muted-foreground">Status:</span> {expense.status}</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</div>
          <p className="text-sm">{expense.description}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-semibold">Item</th>
              <th className="text-right py-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">{expense.title}</td>
              <td className="py-3 text-right">{fmt(expense.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2">
              <td className="py-3 font-bold text-lg">Total Amount</td>
              <td className="py-3 text-right font-bold text-lg text-primary">{fmt(expense.amount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-2 gap-8 pt-8">
          <div className="text-center">
            <div className="border-t border-dashed pt-2 text-sm text-muted-foreground">Prepared By</div>
          </div>
          <div className="text-center">
            <div className="border-t border-dashed pt-2 text-sm text-muted-foreground">Approved By</div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Expense | null>(null);

  const filtered = mockExpenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = mockExpenses.reduce((a, e) => a + e.amount, 0);
  const approved = mockExpenses.filter(e => e.status === "approved").reduce((a, e) => a + e.amount, 0);
  const pending = mockExpenses.filter(e => e.status === "pending").reduce((a, e) => a + e.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track school expenditures and generate receipts.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Expenses</div>
          <div className="text-2xl font-bold mt-1">{fmt(total)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{fmt(approved)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{fmt(pending)}</div>
        </div>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.receiptNo}</TableCell>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[e.category] || "bg-gray-100 text-gray-700"}`}>
                    {e.category}
                  </span>
                </TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell className="font-semibold">{fmt(e.amount)}</TableCell>
                <TableCell>{e.approvedBy}</TableCell>
                <TableCell>
                  <Badge className={
                    e.status === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                    e.status === "pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                    "bg-red-100 text-red-700 hover:bg-red-100"
                  }>
                    {e.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelected(e)}>
                    <Printer className="h-3 w-3 mr-1" /> Receipt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && <Receipt expense={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
