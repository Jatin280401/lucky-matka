interface TelegramIconProps {
  className?: string;
  size?: number;
}

const TelegramIcon = ({ className = "", size = 24 }: TelegramIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.721 3.535l-17.5 7.14c-1.127.46-1.12.1.1.55l4.482 1.402 1.733 5.71c.214.59.11.83.425.83.243 0 .35-.11.488-.242l2.31-2.24 4.8 3.54c.882.486 1.516.236 1.734-.817l3.14-14.8c.322-1.29-.49-1.87-1.34-1.503z" />
  </svg>
);

export default TelegramIcon;
