
import { FaChalkboardTeacher, FaClipboardCheck, FaQuestion, FaFileAlt, FaLaptopCode, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';

const ResourceCard = ({ icon, title, bgColor, borderColor, href }) => (
  <Link href={href} className="flex flex-col items-center">
    <div className={`rounded-full p-4 mb-2 ${bgColor} dark:bg-opacity-20 ${borderColor} dark:border-opacity-20`}>
      {icon}
    </div>
    <span className="text-sm text-gray-600 dark:text-gray-300">{title}</span>
  </Link>
);

export default function ResourceCards() {
  const resources = [
    {
      icon: <FaChalkboardTeacher className="h-6 w-6 text-red-500" />,
      title: "Live Classes",
      bgColor: "bg-red-100",
      borderColor: "border border-red-200",
      href: "/live-classes"
    },
    {
      icon: <FaClipboardCheck className="h-6 w-6 text-green-500" />,
      title: "Live Tests",
      bgColor: "bg-green-100",
      borderColor: "border border-green-200",
      href: "/live-tests"
    },
    {
      icon: <FaQuestion className="h-6 w-6 text-blue-500" />,
      title: "Free Quizzes",
      bgColor: "bg-blue-100",
      borderColor: "border border-blue-200",
      href: "/free-quizzes"
    },
    {
      icon: <FaFileAlt className="h-6 w-6 text-orange-500" />,
      title: "Prev. Year Papers",
      bgColor: "bg-orange-100",
      borderColor: "border border-orange-200",
      href: "/previous-papers"
    },
    {
      icon: <FaLaptopCode className="h-6 w-6 text-purple-500" />,
      title: "Practice",
      bgColor: "bg-purple-100",
      borderColor: "border border-purple-200",
      href: "/practice"
    },
    {
      icon: <FaGlobe className="h-6 w-6 text-cyan-500" />,
      title: "GK & CA",
      bgColor: "bg-cyan-100",
      borderColor: "border border-cyan-200",
      href: "/gk-ca"
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 p-6 my-8 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard key={index} {...resource} />
        ))}
      </div>
    </div>
  );
}