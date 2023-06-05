type ButtonProps = {
  caption: string;
  onClick?: () => void;
  className?: string;
};

export default function Buttton({ caption, onClick, className }: ButtonProps) {
  return (
    <button
      className={`bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-[0.32rem] px-3 border border-blue-500 hover:border-transparent rounded ${className}`}
      onClick={onClick}
    >
      {caption}
    </button>
  );
}
