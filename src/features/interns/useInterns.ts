import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIntern,
  deleteIntern,
  updateIntern,
  fetchInterns,
  fetchEligibleStudents,
  EligibleStudent,
} from "../../services/apiServices";
import toast from "react-hot-toast";

export function useInterns(params?: {
  company_id?: number;
  student_id?: number;
  status?: string;
  major_id?: number;
  year_id?: number;
  per_page?: number;
  page?: number;
}) {
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchInterns(params),
    queryKey: ["interns", params],
  });
  return { interns: data?.data ?? [], total: data?.total, isLoading, isError };
}

export function useCreateIntern() {
  const queryClient = useQueryClient();
  const { mutate: create, isLoading: isCreating } = useMutation({
    mutationFn: createIntern,
    onSuccess: () => {
      toast.success("Intern created successfully");
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { createIntern: create, isCreating };
}

export function useUpdateIntern() {
  const queryClient = useQueryClient();
  const { mutate: update, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status?: string; started_at?: string; ended_at?: string } }) =>
      updateIntern(id, data),
    onSuccess: () => {
      toast.success("Intern updated successfully");
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { updateIntern: update, isUpdating };
}

export function useDeleteIntern() {
  const queryClient = useQueryClient();
  const { mutate: remove, isLoading: isDeleting } = useMutation({
    mutationFn: deleteIntern,
    onSuccess: () => {
      toast.success("Intern deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { deleteIntern: remove, isDeleting };
}

export function useEligibleStudents(company_id?: number) {
  const { data, isLoading, isError } = useQuery<EligibleStudent[]>({
    queryFn: () => fetchEligibleStudents(company_id),
    queryKey: ["eligible-students", company_id],
  });
  return { eligibleStudents: data ?? [], isLoading, isError };
}

export type { EligibleStudent };