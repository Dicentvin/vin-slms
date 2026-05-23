import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import type { UserRole, user } from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsAuth, lmsUsers } from "@/services/lmsApi";

export type FormType = "login" | "create" | "update";

interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}

// Real class options from backend User model enum
const CLASS_OPTIONS = [
  { label: "SS1",  value: "SS1"  },
  { label: "SS2",  value: "SS2"  },
  { label: "SS3",  value: "SS3"  },
  { label: "WAEC", value: "WAEC" },
  { label: "JAMB", value: "JAMB" },
];

const ROLE_OPTIONS = [
  { label: "Student", value: "student" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent",  value: "parent"  },
];

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      email:    z.string().email("Invalid email address"),
      role:     z.string().optional(),
      className: z.string().optional(),
      password:
        type === "update"
          ? z.string().optional().refine((val) => !val || val.length >= 6, {
              message: "Password must be at least 6 characters",
            })
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(6, { message: "Password must be at least 6 characters." })
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

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name:      isUpdate ? (initialData?.name ?? "") : "",
      email:     isUpdate ? (initialData?.email ?? "") : "",
      role:      role ?? "student",
      className: isUpdate ? (initialData?.className ?? "") : "",
      password:  "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      if (isLogin) {
        // ── Real backend login ─────────────────────────────────────
        const result = await lmsAuth.login(data.email, data.password!);
        setLmsToken(result.token);
        localStorage.setItem("lms_token", result.token);

        const loggedInUser: user = {
          _id:            result.user._id,
          name:           result.user.name,
          email:          result.user.email,
          role:           result.user.role as UserRole,
          className:      (result.user as any).className ?? "",
          approvalStatus: (result.user.approvalStatus ?? "pending") as any,
        };
        localStorage.setItem("edunexus_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setYear({
          _id: "y1", name: "2024-2025",
          fromYear: new Date("2024-09-01"), toYear: new Date("2025-06-30"), isCurrent: true,
        });
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        navigate("/dashboard");

      } else if (type === "create") {
        // ── Real backend register ──────────────────────────────────
        await lmsAuth.register(
          data.name!,
          data.email,
          data.password!,
          data.role ?? role ?? "student",
          data.className ?? "",
        );
        toast.success("Account created successfully! The user can now log in.");
        if (onSuccess) onSuccess();

      } else if (type === "update" && initialData?._id) {
        // ── Real backend admin update ──────────────────────────────
        const updates: Record<string, string> = {};
        if (data.name)      updates.name      = data.name;
        if (data.email)     updates.email     = data.email;
        if (data.className !== undefined) updates.className = data.className;

        if (Object.keys(updates).length > 0) {
          await lmsUsers.update(initialData._id, updates);
        }
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? "An error occurred. Please try again.");
    }
  }

  const pending           = form.formState.isSubmitting;
  const selectedRole      = form.watch("role") ?? role;
  const showClassSelector = !isLogin && selectedRole === "student";
  const roleOptions       = role
    ? [{ label: role.charAt(0).toUpperCase() + role.slice(1), value: role }]
    : ROLE_OPTIONS;

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
          {!isLogin && (
            <CustomSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              disabled={pending || !!role}
            />
          )}
          <div className="col-span-2 space-y-2">
            {showClassSelector && (
              <CustomSelect
                control={form.control}
                name="className"
                label="Class"
                placeholder="Select Class"
                options={CLASS_OPTIONS}
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
              placeholder={isUpdate ? "Leave blank to keep unchanged" : "Password"}
              disabled={pending}
            />
          </div>
          {isLogin && (
            <div className="col-span-2 text-xs text-muted-foreground bg-muted rounded-md p-2.5 space-y-1">
              <p className="font-medium text-foreground">Use your registered account</p>
              <p>New users must be registered by the admin first.</p>
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
