import { IoMdPerson } from "react-icons/io";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Link to="/register">
        <IoMdPerson />
      </Link>
    </>
  );
}
