type FileInputProps = {
  onChange: (file: File | null) => void;
};

export default function FileInput({ onChange }: FileInputProps) {
  return (
    <input
      type="file"
      className="relative m-0 block rounded border border-blue-500 border-solid bg-clip-padding px-3 py-[0.32rem] text-base
 font-normal text-neutral-700 transition duration-300 ease-in-out 
 file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 
 file:border-solid file:border-inherit 
 file:px-3 file:py-[0.32rem] 
 file:bg-transparent file:hover:bg-blue-500 file:text-blue-700 file:font-semibold file:hover:text-white
 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] 
 focus:border-primary 
 focus:text-neutral-700 focus:shadow-te-primary focus:outline-none "
      onChange={(e) => {
        // setFile(e.target.files?.[0] ?? null);
        const file = e.target.files?.[0] ?? null;
        // console.log(file);
        onChange(file);
      }}
    />
  );
}
