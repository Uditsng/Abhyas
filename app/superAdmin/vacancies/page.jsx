// app/superAdmin/vacancies/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  createVacancy,
  getVacancies,
  updateVacancy,
  deleteVacancy,
} from "../../../lib/vacancyService";
import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import { FaPlusCircle, FaPencilAlt, FaTrash } from "react-icons/fa";

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVacancy, setCurrentVacancy] = useState(null);

  const fetchVacancies = async () => {
    setIsLoading(true);
    const data = await getVacancies();
    setVacancies(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleOpenModal = (vacancy = null) => {
    if (vacancy) {
      setIsEditing(true);
      setCurrentVacancy(vacancy);
    } else {
      setIsEditing(false);
      setCurrentVacancy({
        title: "",
        organization: "",
        postDate: "",
        lastDateToApply: "",
        examDate: "",
        admitCardDate: "",
        applicationFeeGeneral: "",
        applicationFeeReserved: "",
        ageLimit: "",
        totalPosts: "",
        vacancyDetails: [{ postName: "", eligibility: "", totalPosts: "" }],
        howToApply: "",
        detailsUrl: "",
        applyUrl: "",
        notificationUrl: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentVacancy(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const { id, ...data } = currentVacancy;
      await updateVacancy(id, data);
    } else {
      await createVacancy(currentVacancy);
    }
    fetchVacancies();
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vacancy?")) {
      await deleteVacancy(id);
      fetchVacancies();
    }
  };

  const handleVacancyDetailChange = (index, field, value) => {
    const newDetails = [...currentVacancy.vacancyDetails];
    newDetails[index][field] = value;
    setCurrentVacancy({ ...currentVacancy, vacancyDetails: newDetails });
  };

  const addVacancyDetailRow = () => {
    setCurrentVacancy({
      ...currentVacancy,
      vacancyDetails: [
        ...currentVacancy.vacancyDetails,
        { postName: "", eligibility: "", totalPosts: "" },
      ],
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Vacancies
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <FaPlusCircle className="h-5 w-5" />
          Create New
        </button>
      </div>

      {isLoading ? (
        <p>Loading vacancies...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {vacancies.map((vacancy) => (
              <li
                key={vacancy.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {vacancy.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vacancy.organization}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last Date: {vacancy.lastDateToApply}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(vacancy)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <FaPencilAlt className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vacancy.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-start justify-center p-4 pt-16">
          <DialogPanel className="w-full max-w-2xl mx-auto rounded-lg bg-white dark:bg-gray-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b">
                <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Vacancy" : "Create New Vacancy"}
                </DialogTitle>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="vacancy-form" onSubmit={handleSave} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (e.g., SSC CGL 2025)"
                  value={currentVacancy?.title || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, title: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  required
                />
                {/* updated - Added || "" fallback */}
                <input
                  type="text"
                  placeholder="Organization (e.g., Staff Selection Commission)"
                  value={currentVacancy?.organization || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, organization: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  required
                />

                <h3 className="font-semibold pt-2">Important Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    title="Post Date"
                    value={currentVacancy?.postDate || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, postDate: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                    required
                  />
                  <input
                    type="date"
                    title="Last Date to Apply"
                    value={currentVacancy?.lastDateToApply || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, lastDateToApply: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Exam Date (e.g., 'As per Schedule')"
                    value={currentVacancy?.examDate || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, examDate: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Admit Card Date (e.g., 'Before Exam')"
                    value={currentVacancy?.admitCardDate || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, admitCardDate: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>

                <h3 className="font-semibold pt-2">Application Fee</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Fee (General / OBC / EWS)"
                    value={currentVacancy?.applicationFeeGeneral || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, applicationFeeGeneral: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Fee (SC / ST / PH)"
                    value={currentVacancy?.applicationFeeReserved || ""}
                    onChange={(e) =>
                      setCurrentVacancy({ ...currentVacancy, applicationFeeReserved: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>

                <h3 className="font-semibold pt-2">Vacancy Details</h3>
                <input
                  type="text"
                  placeholder="Age Limit (e.g., 18-27 as on 01/08/2025)"
                  value={currentVacancy?.ageLimit || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, ageLimit: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Total Posts (e.g., 7547)"
                  value={currentVacancy?.totalPosts || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, totalPosts: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />

                {currentVacancy?.vacancyDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-2 p-2 border rounded"
                  >
                    <input
                      type="text"
                      placeholder="Post Name"
                      value={detail.postName}
                      onChange={(e) =>
                        handleVacancyDetailChange(index, "postName", e.target.value)
                      }
                      className="w-full p-1 border rounded dark:bg-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="Eligibility"
                      value={detail.eligibility}
                      onChange={(e) =>
                        handleVacancyDetailChange(index, "eligibility", e.target.value)
                      }
                      className="w-full p-1 border rounded dark:bg-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="Total Posts"
                      value={detail.totalPosts}
                      onChange={(e) =>
                        handleVacancyDetailChange(index, "totalPosts", e.target.value)
                      }
                      className="w-full p-1 border rounded dark:bg-gray-600"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVacancyDetailRow}
                  className="text-sm text-blue-500 hover:underline"
                >
                  + Add Row
                </button>

                <h3 className="font-semibold pt-2">How to Apply</h3>
                <textarea
                  placeholder="Enter step-by-step application instructions..."
                  value={currentVacancy?.howToApply || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, howToApply: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 h-24"
                />

                <h3 className="font-semibold pt-2">Important Links</h3>
                <input
                  type="url"
                  placeholder="Apply Online Link"
                  value={currentVacancy?.applyUrl || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, applyUrl: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
                <input
                  type="url"
                  placeholder="Download Notification Link"
                  value={currentVacancy?.notificationUrl || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, notificationUrl: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
                <input
                  type="url"
                  placeholder="Official Website Link"
                  value={currentVacancy?.detailsUrl || ""}
                  onChange={(e) =>
                    setCurrentVacancy({ ...currentVacancy, detailsUrl: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  required
                />
              </form>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="vacancy-form"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    Save
                </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}