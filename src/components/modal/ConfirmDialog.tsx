import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import GeneralButton from "@components/generalButton/GeneralButton";

interface ConfirmDialogProps {
    open: boolean;
    title: React.ReactNode;
    description: React.ReactNode;
    confirmText: string;
    cancelText: string;
    /** "danger" — деструктивное действие (например, сдача партии). */
    confirmVariant?: "submit" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Универсальная модалка подтверждения действия (MUI Dialog):
 * «Вы уверены…?» + кнопки «Подтвердить» / «Отмена».
 * Закрывается по Escape и по клику на подложку — оба трактуются как «Отмена».
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    description,
    confirmText,
    cancelText,
    confirmVariant = "submit",
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-describedby="confirm-dialog-description"
            keepMounted={false}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
                <GeneralButton bts={confirmVariant} onClick={onConfirm} type="button">
                    {confirmText}
                </GeneralButton>
                <GeneralButton bts="ghost" onClick={onCancel} type="button" autoFocus>
                    {cancelText}
                </GeneralButton>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
