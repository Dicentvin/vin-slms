import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Users, ChevronRight } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Class, pagination } from "@/types";
import Search from "@/components/global/Search";
import CustomAlert from "@/components/global/CustomAlert";
import ClassTable from "@/components/classes/ClassTable";
import ClassForm from "@/components/classes/ClassForm";

// Subject colour mapping
const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  English:     "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Physics:     "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Chemistry:   "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Biology:     "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

const CLASS_CARD_COLORS: Record<string, { border: string; badge: string }> = {
  SS1: { border: "border-blue-200 dark:border-blue-800",   badge: "bg-blue-600" },
  SS2: { border: "border-teal-200 dark:border-teal-800",   badge: "bg-teal-600" },
  SS3: { border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-500" },
};

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<"cards" | "table">("cards");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNum(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);

      const { data } = (await api.get(`/classes?${params.toString()}`)) as {
        data: { classes: Class[]; pagination: pagination };
      };

      if (data.classes) {
        setClasses(data.classes);
        setTotalPages(data.pagination.pages);
      } else {
        setClasses([]);
      }
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, [pageNum, debouncedSearch]);

  const handleCreate = () => { setEditingClass(null); setIsFormOpen(true); };
  const handleEdit = (cls: Class) => { setEditingClass(cls); setIsFormOpen(true); };
  const handleDeleteClick = (id: string) => { setDeleteId(id); setIsDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/classes/delete/${deleteId}`);
      toast.success("Class deleted successfully");
      fetchClasses();
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Senior Secondary Science — SS1 · SS2 · SS3
          </p>
        </div>
        <div className="flex gap-2">
          <Search search={search} setSearch={setSearch} title="Classes" />
          {/* View toggle */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1.5 font-medium transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 font-medium transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Table
            </button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        </div>
      </div>

      {/* Cards view */}
      {view === "cards" && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const colors = CLASS_CARD_COLORS[cls.name] ?? { border: "border-border", badge: "bg-primary" };
            const teacherName = typeof cls.classTeacher === "object"
              ? cls.classTeacher?.name
              : "—";

            return (
              <Card key={cls._id} className={`border-2 ${colors.border} hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${colors.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                          {cls.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {cls.academicYear?.name ?? "2024-2025"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{cls.name} — Science Stream</CardTitle>
                      <CardDescription>
                        Class teacher: {teacherName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats row */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Capacity: {cls.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {cls.subjects?.length ?? 5} subjects
                    </span>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(cls.subjects?.length
                        ? cls.subjects
                        : [
                            { _id: "s1", name: "Mathematics" },
                            { _id: "s2", name: "English" },
                            { _id: "s3", name: "Physics" },
                            { _id: "s4", name: "Chemistry" },
                            { _id: "s5", name: "Biology" },
                          ]
                      ).map((subj) => (
                        <span
                          key={subj._id}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${SUBJECT_COLORS[subj.name] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {subj.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(cls)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(cls._id)}
                    >
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredClasses.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              No classes found.
            </div>
          )}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <ClassTable
          data={classes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          page={pageNum}
          setPage={setPageNum}
          totalPages={totalPages}
        />
      )}

      {loading && view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 bg-muted rounded w-1/3" /></CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(j => <div key={j} className="h-5 w-16 bg-muted rounded-full" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClassForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingClass}
        onSuccess={fetchClasses}
      />
      <CustomAlert
        handleDelete={confirmDelete}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone."
      />
    </div>
  );
};

export default Classes;
