"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type Props = {
  loading?: boolean;
  showText?: boolean;
  onConfirm: () => void;
};

export default function DeleteConfirmDialog({ loading, showText, onConfirm }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <a
          className={`${
            showText
              ? "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 text-red-500 focus:text-red-600 dark:hover:bg-white/5"
              : "flex w-full justify-center gap-3 text-red-500 cursor-pointer"
          }`}
          href="#"
        >
          <Trash2 className="h-4 w-4" />
          {showText && "Устгах"}
        </a>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
          {/* <AlertDialogDescription>
            Энэ үйлдлийг буцаах боломжгүй. Байгууллагын мэдээлэл бүрмөсөн устгагдана.
          </AlertDialogDescription> */}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-700"
          >
            {loading ? "Устгаж байна..." : "Тийм, устгах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
