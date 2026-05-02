import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSlot,
  deleteSlot,
  updateSlot,
  fetchSlots,
  bookSlot,
  cancelSlotBooking,
  Slot,
} from "../../services/apiServices";
import toast from "react-hot-toast";

export type { Slot };

export function useSlots() {
  const { data, isLoading, isError } = useQuery({
    queryFn: fetchSlots,
    queryKey: ["slots"],
  });
  return { slots: data, isLoading, isError };
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  const { mutate: create, isLoading: isCreating } = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      toast.success("Slot created successfully");
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { createSlot: create, isCreating };
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  const { mutate: update, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { interviewer: string; slot_time: string } }) =>
      updateSlot(id, data),
    onSuccess: () => {
      toast.success("Slot updated successfully");
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { updateSlot: update, isUpdating };
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  const { mutate: remove, isLoading: isDeleting } = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      toast.success("Slot deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { deleteSlot: remove, isDeleting };
}

export function useBookSlot() {
  const queryClient = useQueryClient();
  const { mutate: book, isLoading: isBooking } = useMutation({
    mutationFn: ({ slotId, studentId }: { slotId: number; studentId: number }) =>
      bookSlot(slotId, studentId),
    onSuccess: () => {
      toast.success("Slot booked successfully");
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { bookSlot: book, isBooking };
}

export function useCancelSlot() {
  const queryClient = useQueryClient();
  const { mutate: cancel, isLoading: isCancelling } = useMutation({
    mutationFn: cancelSlotBooking,
    onSuccess: () => {
      toast.success("Slot booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { cancelSlot: cancel, isCancelling };
}