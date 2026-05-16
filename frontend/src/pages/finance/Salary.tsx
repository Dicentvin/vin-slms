import { useState } from "react";
import { Printer, Search, CheckCircle, Clock } from "lucide-react";
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

interface SalaryRecord {
  id: string;
  staffName: string;
  staffId: string;
  role: string;
  department: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "paid" | "pending";
  payslipNo: string;
  payDate?: string;
}

const mockSalaries: SalaryRecord[] = [
  { id: "1", staffName: "Mr. James Johnson", staffId: "STF001", role: "Teacher", department: "Mathematics", month: "March 2025", basicSalary: 120000, allowances: 30000, deductions: 15000, netSalary: 135000, status: "paid", payslipNo: "PAY-2025-001", payDate: "2025-03-28" },
  { id: "2", staffName: "Ms. Sarah Williams", staffId: "STF002", role: "Teacher", department: "Sciences", month: "March 2025", basicSalary: 120000, allowances: 30000, deductions: 15000, netSalary: 135000, status: "paid", payslipNo: "PAY-2025-002", payDate: "2025-03-28" },
  { id: "3", staffName: "Mr. Robert Davis", staffId: "STF003", role: "Teacher", department: "Humanities", month: "March 2025", basicSalary: 115000, allowances: 25000, deductions: 14000, netSalary: 126000, status: "pending", payslipNo: "PAY-2025-003" },
  { id: "4", staffName: "Ms. Emily Chen", staffId: "STF004", role: "Teacher", department: "Computer Science", month: "March 2025", basicSalary: 130000, allowances: 35000, deductions: 18000, netSalary: 147000, status: "paid", payslipNo: "PAY-2025-004", payDate: "2025-03-28" },
  { id: "5", staffName: "Mr. David Brown", staffId: "STF005", role: "Teacher", department: "Geography", month: "March 2025", basicSalary: 115000, allowances: 25000, deductions: 14000, netSalary: 126000, status: "pending", payslipNo: "PAY-2025-005" },
  { id: "6", staffName: "Admin User", staffId: "STF006", role: "Admin", department: "Administration", month: "March 2025", basicSalary: 200000, allowances: 50000, deductions: 30000, netSalary: 220000, status: "paid", payslipNo: "PAY-2025-006", payDate: "2025-03-28" },
];

const fmt = (n: number) => `₦${n.toLocaleString()}`;

const Payslip = ({ record, onClose }: { record: SalaryRecord; onClose: () => void }) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          Payslip — {record.payslipNo}
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
            <div className="text-2xl font-bold text-primary">PAYSLIP</div>
            <div className="text-sm text-muted-foreground">{record.payslipNo}</div>
            <div className="text-sm text-muted-foreground">{record.month}</div>
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Employee Details</div>
            <div className="font-semibold">{record.staffName}</div>
            <div className="text-sm text-muted-foreground">ID: {record.staffId}</div>
            <div className="text-sm text-muted-foreground">Role: {record.role}</div>
            <div className="text-sm text-muted-foreground">Department: {record.department}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Info</div>
            <div className="text-sm"><span className="text-muted-foreground">Period:</span> {record.month}</div>
            <div className="text-sm"><span className="text-muted-foreground">Status:</span> {record.status}</div>
            {record.payDate && <div className="text-sm"><span className="text-muted-foreground">Pay Date:</span> {record.payDate}</div>}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-semibold">Earnings</th>
              <th className="text-right py-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Basic Salary</td>
              <td className="py-2 text-right">{fmt(record.basicSalary)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Allowances</td>
              <td className="py-2 text-right text-green-600">+{fmt(record.allowances)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Deductions (Tax / Pension)</td>
              <td className="py-2 text-right text-red-600">-{fmt(record.deductions)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2">
              <td className="py-3 font-bold text-lg">Net Salary</td>
              <td className="py-3 text-right font-bold text-lg text-primary">{fmt(record.netSalary)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          This is a computer-generated payslip and requires no signature.
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function Salary() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SalaryRecord | null>(null);

  const filtered = mockSalaries.filter(s =>
    s.staffName.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = mockSalaries.filter(s => s.status === "paid").reduce((a, s) => a + s.netSalary, 0);
  const totalPending = mockSalaries.filter(s => s.status === "pending").reduce((a, s) => a + s.netSalary, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">Manage staff salaries and generate payslips.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Staff</div>
          <div className="text-2xl font-bold mt-1">{mockSalaries.length}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Paid</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{fmt(totalPaid)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Pending Payment</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{fmt(totalPending)}</div>
        </div>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payslip No</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Basic</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.payslipNo}</TableCell>
                <TableCell className="font-medium">{s.staffName}</TableCell>
                <TableCell>{s.department}</TableCell>
                <TableCell>{fmt(s.basicSalary)}</TableCell>
                <TableCell className="text-green-600">+{fmt(s.allowances)}</TableCell>
                <TableCell className="text-red-600">-{fmt(s.deductions)}</TableCell>
                <TableCell className="font-bold">{fmt(s.netSalary)}</TableCell>
                <TableCell>
                  {s.status === "paid"
                    ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle className="h-3 w-3" />Paid</Badge>
                    : <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><Clock className="h-3 w-3" />Pending</Badge>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                    <Printer className="h-3 w-3 mr-1" /> Payslip
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && <Payslip record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
