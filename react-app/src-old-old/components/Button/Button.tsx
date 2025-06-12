import { Button } from "@mui/material";

interface MyButtonProps {
  label: string;
  onClick: () => void;
}

function MyButton({ label, onClick }: MyButtonProps) {
  return <Button onClick={onClick}>{label}</Button>;
}

export default MyButton;
