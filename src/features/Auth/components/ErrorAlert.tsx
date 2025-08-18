type ErrorAlertProps = {
  message: string;
};

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md text-center">
      {message}
    </div>
  );
}