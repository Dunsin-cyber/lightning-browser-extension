import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  description?: string;
  logo?: string;
};

export default function LinkButton({ to, title, description, logo }: Props) {
  return (
    <Link to={to} className="block">
      <div className="p-4 bg-white h-96 text-center shadow overflow-hidden border-b border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
        <div className="my-12">
          <img
            src={logo}
            alt="logo"
            width="135px"
            height="110px"
            className="inline rounded-3xl "
          />
        </div>
        <div className="">
          <span className="block text-lg">{title}</span>
          {description && (
            <span className="text-sm text-gray-500">{description}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
