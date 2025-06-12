import Button, { ButtonProps } from "@mui/material/Button";

interface MyButtonProps extends ButtonProps {
  label: string;
  onClick: () => void;
  sx?: any;
}

export default function MyButton({
  label,
  onClick,
  variant,
  color,
  size,
  sx,
}: MyButtonProps) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      sx={{ ...sx }}
    >
      {label}
    </Button>
  );
}
