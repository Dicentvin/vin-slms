import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import type { Class, UserRole, pagination, subject, user } from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useEffect, useState } from "react";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsAuth } from "@/services/lmsApi";

export type FormType = "login" | "create" | "update";

interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      classId:    z.string().optional(),
      subjectIds: z.array(z.string()).optional(),
      email:      z.string().email("Invalid email address"),
      role:       z.string().optional(),
      password:
        type === "update"
          ? z.string().optional().refine((val) => !val || val.length >= 6, {
              message: "Password must be at least 6 characters",
            })
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(8, { message: "Password must be at least 8 characters." })
          : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (type === "create" && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const UniversalUserForm = ({ type, initialData, onSuccess, role }: Props) => {
  const isUpdate = type === "update";
  const isLogin  = type === "login";
  const { setUser, setYear, setLmsToken } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses]           = useState<Class[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subjects, setSubjects]         = useState<subject[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name:       "",
      email:      "",
      role:       role,
      password:   "",
      classId:    undefined,
      subjectIds: [],
    },
  });

  useEffect(() => {
    if (isLogin) { setLoading(false); return; }
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data } = (await api.get("/classes")) as {
          data: { classes: Class[]; pagination: pagination };
        };
        setClasses(data.classes);
      } catch {
        toast.error("Failed to load Classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) { setLoadingOptions(false); return; }
    const fetchSubjects = async () => {
      try {
        setLoadingOptions(true);
        const { data } = (await api.get("/subjects")) as {
          data: { subjects: subject[]; pagination: pagination };
        };
        setSubjects(data.subjects);
      } catch {
        toast.error("Failed to load subjects");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchSubjects();
  }, [isLogin]);

  useEffect(() => {
    if (initialData && isUpdate) {
      const existingClassId =
        typeof initialData.studentClass === "object"
          ? initialData.studentClass?._id
          : initialData.studentClass;
      form.reset({
        name:       initialData.name || "",
        email:      initialData.email || "",
        role:       initialData.role || "student",
        password:   "",
        classId:    existingClassId || "",
        subjectIds: initialData.teacherSubjects?.map((s) => s._id) || [],
      });
    }
  }, [isUpdate, initialData, form]);

  async function onSubmit(data: FormValues) {
    try {
      if (isLogin) {
        // ── Call the REAL lms-backend login ──────────────────────────
        let backendToken: string;
        let backendUser: any;

        try {
          const result = await lmsAuth.login(data.email, data.password);
          backendToken = result.token;
          backendUser  = result.user;
        } catch (err: any) {
          toast.error(err.message ?? "Invalid email or password.");
          return;
        }

        // Save the real JWT so lmsApi.ts can use it for all future requests
        setLmsToken(backendToken);
        localStorage.setItem("lms_token", backendToken);

        // Build UI user object from backend response
        const loggedInUser: user = {
          _id:   backendUser._id ?? backendUser.id ?? "u1",
          name:  backendUser.name,
          email: backendUser.email,
          role:  backendUser.role ?? "student",
        };

        localStorage.setItem("edunexus_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setYear({
          _id:       "y1",
          name:      "2024-2025",
          fromYear:  new Date("2024-09-01"),
          toYear:    new Date("2025-06-30"),
          isCurrent: true,
        });

        toast.success(`Welcome back, ${loggedInUser.name}!`);
        navigate("/dashboard");

      } else if (type === "create") {
        const payload = {
          studentClass:    data.classId ?? undefined,
          teacherSubjects: data.subjectIds ?? [],
          ...data,
        };
        await api.post("/users/register", payload);
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();

      } else if (type === "update" && initialData?._id) {
        const payload = {
          studentClass:    data.classId ?? undefined,
          teacherSubjects: data.subjectIds ?? [],
          ...data,
        };
        await api.put(`/users/update/${initialData._id}`, payload);
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  }

  const classOptions   = Array.isArray(classes)  ? classes.map((c)  => ({ label: c.name,  value: c._id }))  : [];
  const subjectOptions = Array.isArray(subjects)  ? subjects.map((s) => ({ label: s.name,  value: s._id }))  : [];
  const roleOptions    = role ? [{ label: role, value: role }] : [];

  const pending            = form.formState.isSubmitting;
  const showRoleSelector   = !isLogin;
  const showClassSelector  = !isLogin && role === "student";
  const showSubjectSelector= !isLogin && role === "teacher";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4 w-full">
          {!isLogin && (
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              disabled={pending}
            />
          )}
          {showRoleSelector && (
            <CustomSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              disabled={pending}
            />
          )}
          <div className="col-span-2 space-y-2">
            {showClassSelector && (
              <CustomSelect
                control={form.control}
                name="classId"
                label="Class"
                placeholder="Select Class"
                options={classOptions}
                disabled={pending}
                loading={loading}
              />
            )}
            {showSubjectSelector && (
              <CustomMultiSelect
                control={form.control}
                name="subjectIds"
                label="Subjects"
                placeholder="Select subjects..."
                options={subjectOptions}
                loading={loadingOptions}
                disabled={pending}
              />
            )}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@school.edu"
              disabled={pending}
            />
          </div>
          <div className="col-span-2">
            <CustomInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder={isUpdate ? "New Password (Optional)" : "Password"}
              disabled={pending}
            />
          </div>
          {/* Hint shown only on login form */}
          {isLogin && (
            <div className="col-span-2 text-xs text-muted-foreground bg-muted rounded-md p-2.5 space-y-1">
              <p className="font-medium text-foreground">Use your registered account</p>
              <p>Register first at <span className="font-medium">/api/auth/register</span> if you haven't already.</p>
            </div>
          )}
          {type === "create" && (
            <div className="col-span-2">
              <CustomInput
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm Password"
                disabled={pending}
              />
            </div>
          )}
          <div className="col-span-2 mt-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Processing..."
                : type === "login"
                ? "Sign In"
                : type === "create"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};

export default UniversalUserForm;
