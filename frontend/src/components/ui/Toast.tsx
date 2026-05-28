import "./Toast.css";

type ToastProps = {
  message: string;
};

function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default Toast;
