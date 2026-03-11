import { Mail, Phone } from "lucide-react";

type TeacherProfileHeaderCardProps = {
  name: string;
  status: string | null;
  publicId: string | number;
  phone: string;
  email: string;
};

export function TeacherProfileHeaderCard({
  name,
  status,
  publicId,
  phone,
  email,
}: TeacherProfileHeaderCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-extrabold text-blue-700">
            {name?.[0] ?? "T"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-2xl font-extrabold text-gray-900">{name}</div>
              {status ? (
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {status}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Teacher ID: <span className="font-semibold text-gray-900">{publicId}</span>
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto md:min-w-[320px]">
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-500">Phone</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {phone === "—" ? (
                phone
              ) : (
                <a
                  href={`tel:${phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-500">Email</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {email === "—" ? (
                email
              ) : (
                <a
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
