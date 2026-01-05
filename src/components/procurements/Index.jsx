import React, { useEffect, useState } from "react";
import api2 from "../../store/api2"; // Sesuaikan path sesuai struktur project Anda
import { useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import { FiEdit } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

// Dalam component:
import axios from "axios";
import logoDark from "../../assets/img/logo-ct-dark.png";
import logoLight from "../../assets/img/logo-ct.png";
import team2 from "../../assets/img/team-2.jpg";
import logoSpotify from "../../assets/img/small-logos/logo-spotify.svg";
import "../../assets/css/argon-dashboard-tailwind.css";
import "../../assets/css/nucleo-svg.css";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { TvIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Index = () => {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api2.get("/api/procurements");

      // FIX: Handle different response formats properly
      let data = response.data;

      // Jika response memiliki structure { data: [...] }
      if (data && typeof data === "object" && data.data) {
        data = data.data;
      }

      // Jika response memiliki structure { success: true, data: [...] }
      if (data && typeof data === "object" && data.success && data.data) {
        data = data.data;
      }

      // Pastikan data adalah array
      if (Array.isArray(data)) {
        setProcurements(data);
      } else if (data && typeof data === "object") {
        // Jika data adalah single object, convert ke array
        setProcurements([data]);
      } else {
        console.warn("Unexpected data format:", data);
        setProcurements([]);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          `Access Denied (403): ${
            err.response.data?.message || "Check CSRF configuration"
          }`
        );
      } else if (err.response?.status === 401) {
        setError("Unauthorized: Please check authentication");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network Error: Check if Laravel server is running");
      } else {
        setError(`Error: ${err.message}`);
      }
      setProcurements([]); // Reset ke empty array jika error
    } finally {
      setLoading(false);
    }
  };

  // Test dengan data mock untuk debugging
  const loadMockData = () => {
    setProcurements([
      {
        id: 3,
        status: "draft",
        date: "2025-10-12T11:52:43.000000Z",
        procurement_item: {
          id: 3,
          item_name: "Kertas HVS A4",
          image_url:
            "assets/procurements/TiJ1dOp9RlJbWbh5R00DkrLSV5YmFk3xkGsu7tcs.jpg",
          description: null,
          quantity: 25,
          price: 50000,
          sub_total: 1250000,
          is_maintainable: false,
          notes: "Kertas HVS untuk ruangan 101 gedung viktor",
          approved_by_structural_requester_at: null,
        },
      },
      {
        id: 4,
        status: "approved",
        date: "2025-10-13T10:30:00.000000Z",
        procurement_item: {
          id: 4,
          item_name: "Pulpen Pilot",
          image_url: null,
          description: "Pulpen warna hitam",
          quantity: 50,
          price: 3000,
          sub_total: 150000,
          is_maintainable: false,
          notes: "Untuk stok kantor",
          approved_by_structural_requester_at: "2025-10-13T11:00:00.000000Z",
        },
      },
    ]);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  const truncateString = (str, maxLength) => {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);

      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const handleDelete = async (procurement) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus "${procurement.procurement_item?.item_name}"?`
      )
    ) {
      return;
    }

    try {
      // Gunakan api yang sudah Anda definisikan, bukan fetch langsung
      await api2.delete(`/api/procurements/${procurement.id}`);

      // Update state - hapus item yang dihapus dari state
      setProcurements((prev) => prev.filter((p) => p.id !== procurement.id));

      alert(`"${procurement.procurement_item?.item_name}" berhasil dihapus`);
    } catch (error) {
      console.error("Error deleting procurement:", error);
      alert("Terjadi error saat menghapus procurement");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Safe function untuk render procurement items
  const renderProcurementRow = (procurement) => {
    if (!procurement || typeof procurement !== "object") {
      return (
        <tr>
          <td colSpan="4" className="px-6 py-4 text-center text-red-500">
            Invalid data format
          </td>
        </tr>
      );
    }

    return (
      <tr
        key={procurement.id}
        className="border-b border-slate-100 hover:bg-slate-50"
      >
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {truncateString(procurement.procurement_item?.item_name, 30) ||
                  "No Item Name"}
              </p>
              {procurement.procurement_item?.quantity && (
                <p className="text-xs text-slate-500">
                  Qty: {procurement.procurement_item.quantity} | Price: Rp{" "}
                  {procurement.procurement_item.price?.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              procurement.status
            )}`}
          >
            {procurement.status?.toUpperCase() || "UNKNOWN"}
          </span>
        </td>
        <td className="px-6 py-4 text-sm">{formatDate(procurement.date)}</td>

        <td className="px-6 py-4">
          <div className="flex space-x-4">
            {/* Tombol Edit */}
            <div className="relative group inline-block">
              <button
                onClick={() =>
                  navigate(`/procurements-update/${procurement.id}`)
                }
                className="text-green-600 hover:text-green-800"
              >
                <FiEdit size={20} />
              </button>

              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-gray-800 text-white px-2 py-1 text-xs opacity-0 invisible group-hover:visible group-hover:opacity-100 transition z-50 whitespace-nowrap">
                Edit
              </span>
            </div>

            {/* Tombol Delete */}
            <div className="relative group">
              <button
                onClick={() => handleDelete(procurement)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="ri-delete-bin-line text-xl"></i>
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                Delete
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default bg-gray-50 text-slate-500">
      <div className="absolute w-full bg-blue-500 dark:hidden min-h-75"></div>

      <aside className="fixed m-4 flex flex-col items-start justify-between w-64 h-screen p-0 overflow-hidden bg-white shadow-xl dark:bg-slate-850 ease-nav-brand z-[999] rounded-2xl transition-transform duration-200 xl:translate-x-0">
        {/* Header logo */}
        <div className="w-full p-3">
          <a
            className="block px-8 py-6 text-sm whitespace-nowrap dark:text-white text-slate-700"
            href="#"
          >
            <img
              src={logoDark}
              className="inline h-full max-w-full transition-all duration-200 dark:hidden ease-nav-brand max-h-8"
              alt="main_logo"
            />
            <img
              src={logoLight}
              className="hidden h-full max-w-full transition-all duration-200 dark:inline ease-nav-brand max-h-8"
              alt="main_logo"
            />
            <span className="ml-1 font-semibold transition-all duration-200 ease-nav-brand">
              Argon Dashboard 2
            </span>
          </a>
        </div>
        <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent" />

        <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
          <ul className="flex flex-col pl-0 mb-0">
            <li className="mt-0.5 w-full">
              <Link
                to="/"
                className="py-2.7 bg-blue-500/13 text-sm my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700 transition-colors"
                href="#"
              >
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg">
                  <TvIcon className="h-4 w-4 text-blue-500" />
                </div>
                <span className="ml-1">Dashboard</span>
              </Link>
            </li>
            <li className="mt-0.5 w-full">
              <Link
                to="/procurement"
                className=" dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors"
              >
                <div className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                  <CalendarIcon className="text-orange-500" />
                </div>
                <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">
                  Procurement
                </span>
              </Link>
            </li>

            <li className="w-full mt-4">
              <h6 className="pl-6 ml-2 text-xs font-bold leading-tight uppercase dark:text-white opacity-60">
                Account pages
              </h6>
            </li>

            {/* <li className="mt-0.5 w-full">
              <a className=" dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors" href="./pages/profile.html">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                  <i className="relative top-0 text-sm leading-normal text-slate-700 ni ni-single-02"></i>
                </div>
                <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Profile</span>
              </a>
            </li> */}

            <li className="mt-0.5 w-full">
              <Link
                to="/signin"
                className="dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors"
              >
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                  <i className="relative top-0 text-sm leading-normal text-orange-500 ni ni-single-copy-04"></i>
                </div>
                <span className="ml-1 duration-300 opacity-100 ease">
                  Logout
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
        <nav
          className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start"
          navbar-main
          navbar-scroll="false"
        >
          <div className="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
            <nav>
              <ol className="flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16">
                <li className="text-sm leading-normal">
                  <a className="text-white opacity-50" href="javascript:;">
                    Pages
                  </a>
                </li>
                <li
                  className="text-sm pl-2 capitalize leading-normal text-white before:float-left before:pr-2 before:text-white before:content-['/']"
                  aria-current="page"
                >
                  Dashboard
                </li>
              </ol>
              <h6 className="mb-0 font-bold text-white capitalize">
                Dashboard
              </h6>
            </nav>

            <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
              <div className="flex items-center md:ml-auto md:pr-4">
                <div className="relative flex flex-wrap items-stretch w-full transition-all rounded-lg ease">
                  <span className="text-sm ease leading-5.6 absolute z-50 -ml-px flex h-full items-center whitespace-nowrap rounded-lg rounded-tr-none rounded-br-none border border-r-0 border-transparent bg-transparent py-2 px-2.5 text-center font-normal text-slate-500 transition-all">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="pl-9 text-sm focus:shadow-primary-outline ease w-1/100 leading-5.6 relative -ml-px block min-w-0 flex-auto rounded-lg border border-solid border-gray-300 dark:bg-slate-850 dark:text-white bg-white bg-clip-padding py-2 pr-3 text-gray-700 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:transition-shadow"
                    placeholder="Type here..."
                  />
                </div>
              </div>
              <ul className="flex flex-row justify-end pl-0 mb-0 list-none md-max:w-full">
                {/* <li className="flex items-center">
                    <a className="inline-block px-8 py-2 mb-0 mr-4 text-xs font-bold text-center text-blue-500 uppercase align-middle transition-all ease-in bg-transparent border border-blue-500 border-solid rounded-lg shadow-none cursor-pointer leading-pro hover:-translate-y-px active:shadow-xs hover:border-blue-500 active:bg-blue-500 active:hover:text-blue-500 hover:text-blue-500 tracking-tight-rem hover:bg-transparent hover:opacity-75 hover:shadow-none active:text-white active:hover:bg-transparent" target="_blank" href="https://www.creative-tim.com/builder/soft-ui?ref=navbar-dashboard&amp;_ga=2.76518741.1192788655.1647724933-1242940210.1644448053">Online Builder</a>
                  </li>  */}
                <li className="flex items-center">
                  <Link
                    to="/signin"
                    className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
                  >
                    <i className="fa fa-user sm:mr-1"></i>
                    <span className="hidden sm:inline">Logout</span>
                  </Link>
                </li>
                <li className="flex items-center pl-4 xl:hidden">
                  <a
                    href="javascript:;"
                    className="block p-0 text-sm text-white transition-all ease-nav-brand"
                    sidenav-trigger
                  >
                    <div className="w-4.5 overflow-hidden">
                      <i className="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all"></i>
                      <i className="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all"></i>
                      <i className="ease relative block h-0.5 rounded-sm bg-white transition-all"></i>
                    </div>
                  </a>
                </li>
                <li className="flex items-center px-4">
                  <a
                    href="javascript:;"
                    className="p-0 text-sm text-white transition-all ease-nav-brand"
                  >
                    <i
                      fixed-plugin-button-nav
                      className="cursor-pointer fa fa-cog"
                    ></i>
                  </a>
                </li>

                <li className="relative flex items-center pr-2">
                  <p className="hidden transform-dropdown-show"></p>
                  <a
                    href="javascript:;"
                    className="block p-0 text-sm text-white transition-all ease-nav-brand"
                    dropdown-trigger
                    aria-expanded="false"
                  >
                    <i className="cursor-pointer fa fa-bell"></i>
                  </a>

                  <ul
                    dropdown-menu
                    className="text-sm transform-dropdown before:font-awesome before:leading-default before:duration-350 before:ease lg:shadow-3xl duration-250 min-w-44 before:sm:right-8 before:text-5.5 pointer-events-none absolute right-0 top-0 z-50 origin-top list-none rounded-lg border-0 border-solid border-transparent dark:shadow-dark-xl dark:bg-slate-850 bg-white bg-clip-padding px-2 py-4 text-left text-slate-500 opacity-0 transition-all before:absolute before:right-2 before:left-auto before:top-0 before:z-50 before:inline-block before:font-normal before:text-white before:antialiased before:transition-all before:content-['\f0d8'] sm:-mr-6 lg:absolute lg:right-0 lg:left-auto lg:mt-2 lg:block lg:cursor-pointer"
                  >
                    <li className="relative mb-2">
                      <a
                        className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg bg-transparent px-4 duration-300 hover:bg-gray-200 hover:text-slate-700 lg:transition-colors"
                        href="javascript:;"
                      >
                        <div className="flex py-1">
                          <div className="my-auto">
                            <img
                              src={team2}
                              className="inline-flex items-center justify-center mr-4 text-sm text-white h-9 w-9 max-w-none rounded-xl"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white">
                              <span className="font-semibold">New message</span>{" "}
                              from Laur
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                              <i className="mr-1 fa fa-clock"></i>
                              13 minutes ago
                            </p>
                          </div>
                        </div>
                      </a>
                    </li>

                    <li className="relative mb-2">
                      <a
                        className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg px-4 transition-colors duration-300 hover:bg-gray-200 hover:text-slate-700"
                        href="javascript:;"
                      >
                        <div className="flex py-1">
                          <div className="my-auto">
                            <img
                              src={logoSpotify}
                              className="inline-flex items-center justify-center mr-4 text-sm text-white bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 h-9 w-9 max-w-none rounded-xl"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white">
                              <span className="font-semibold">New album</span>{" "}
                              by Travis Scott
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                              <i className="mr-1 fa fa-clock"></i>1 day
                            </p>
                          </div>
                        </div>
                      </a>
                    </li>

                    <li className="relative">
                      <a
                        className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg px-4 transition-colors duration-300 hover:bg-gray-200 hover:text-slate-700"
                        href="javascript:;"
                      >
                        <div className="flex py-1">
                          <div className="inline-flex items-center justify-center my-auto mr-4 text-sm text-white transition-all duration-200 ease-nav-brand bg-gradient-to-tl from-slate-600 to-slate-300 h-9 w-9 rounded-xl">
                            <svg
                              width="12px"
                              height="12px"
                              viewBox="0 0 43 36"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlns:xlink="http://www.w3.org/1999/xlink"
                            >
                              <title>credit-card</title>
                              <g
                                stroke="none"
                                stroke-width="1"
                                fill="none"
                                fill-rule="evenodd"
                              >
                                <g
                                  transform="translate(-2169.000000, -745.000000)"
                                  fill="#FFFFFF"
                                  fill-rule="nonzero"
                                >
                                  <g transform="translate(1716.000000, 291.000000)">
                                    <g transform="translate(453.000000, 454.000000)">
                                      <path
                                        className="color-background"
                                        d="M43,10.7482083 L43,3.58333333 C43,1.60354167 41.3964583,0 39.4166667,0 L3.58333333,0 C1.60354167,0 0,1.60354167 0,3.58333333 L0,10.7482083 L43,10.7482083 Z"
                                        opacity="0.593633743"
                                      ></path>
                                      <path
                                        className="color-background"
                                        d="M0,16.125 L0,32.25 C0,34.2297917 1.60354167,35.8333333 3.58333333,35.8333333 L39.4166667,35.8333333 C41.3964583,35.8333333 43,34.2297917 43,32.25 L43,16.125 L0,16.125 Z M19.7083333,26.875 L7.16666667,26.875 L7.16666667,23.2916667 L19.7083333,23.2916667 L19.7083333,26.875 Z M35.8333333,26.875 L28.6666667,26.875 L28.6666667,23.2916667 L35.8333333,23.2916667 L35.8333333,26.875 Z"
                                      ></path>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white">
                              Payment successfully completed
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                              <i className="mr-1 fa fa-clock"></i>2 days
                            </p>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="w-full px-6 py-6 mx-auto">
          <div className="flex flex-wrap mt-6 -mx-3">
            <div className="flex-none w-full max-w-full px-3">
              <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl rounded-2xl bg-clip-border">
                <div className="p-6 pb-0 mb-0 border-b-0 border-b-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="text-lg font-semibold">Procurement Items</h6>
                    <div className="flex space-x-2">
                      <Link
                        to="/procurements-create"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Create Data
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex-auto px-0 pt-0 pb-2">
                  <div className="p-0 overflow-x-auto">
                    {loading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">
                          Loading procurement data...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center p-8">
                        <div className="text-red-500 text-center mb-4">
                          <p className="font-semibold text-lg">
                            API Connection Issue
                          </p>
                          <p className="mt-2">{error}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={fetchProcurements}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={loadMockData}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Use Mock Data
                          </button>
                        </div>
                      </div>
                    ) : !Array.isArray(procurements) ||
                      procurements.length === 0 ? (
                      <div className="flex flex-col items-center p-8">
                        <p className="text-gray-500 mb-4">
                          No procurement data found
                        </p>
                        <button
                          onClick={loadMockData}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Use Mock Data
                        </button>
                      </div>
                    ) : (
                      <div className="w-full overflow-x-auto">
                        <table className="items-center mb-0 align-top border-collapse text-slate-500 max-w-[1100px]">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Item Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Disetujui Kaprodi
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Disetujui Kepala Gedung
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Disetujui IT
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Disetujui Bagian Keuangan
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Disetujui Bagian Pengadaan
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Diterima Kepala Gudang
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-400 opacity-70">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {procurements.map(renderProcurementRow)}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div fixed-plugin>
        <a
          fixed-plugin-button
          className="fixed px-4 py-2 text-xl bg-white shadow-lg cursor-pointer bottom-8 right-8 z-990 rounded-circle text-slate-700"
        >
          <i className="py-2 pointer-events-none fa fa-cog"> </i>
        </a>
        <div
          fixed-plugin-card
          className="z-sticky backdrop-blur-2xl backdrop-saturate-200 dark:bg-slate-850/80 shadow-3xl w-90 ease -right-90 fixed top-0 left-auto flex h-full min-w-0 flex-col break-words rounded-none border-0 bg-white/80 bg-clip-border px-2.5 duration-200"
        >
          <div className="px-6 pt-4 pb-0 mb-0 border-b-0 rounded-t-2xl">
            <div className="float-left">
              <h5 className="mt-4 mb-0 dark:text-white">Argon Configurator</h5>
              <p className="dark:text-white dark:opacity-80">
                See our dashboard options.
              </p>
            </div>
            <div className="float-right mt-6">
              <button
                fixed-plugin-close-button
                className="inline-block p-0 mb-4 text-sm font-bold leading-normal text-center uppercase align-middle transition-all ease-in bg-transparent border-0 rounded-lg shadow-none cursor-pointer hover:-translate-y-px tracking-tight-rem bg-150 bg-x-25 active:opacity-85 dark:text-white text-slate-700"
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          </div>
          <hr className="h-px mx-0 my-1 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent" />
          <div className="flex-auto p-6 pt-0 overflow-auto sm:pt-4">
            <div>
              <h6 className="mb-0 dark:text-white">Sidebar Colors</h6>
            </div>
            <a href="javascript:void(0)">
              <div className="my-2 text-left" sidenav-colors>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-blue-500 to-violet-500 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-slate-700 text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  active-color
                  data-color="blue"
                  onclick="sidebarColor(this)"
                ></span>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-white text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  data-color="gray"
                  onclick="sidebarColor(this)"
                ></span>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-blue-700 to-cyan-500 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-white text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  data-color="cyan"
                  onclick="sidebarColor(this)"
                ></span>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-emerald-500 to-teal-400 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-white text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  data-color="emerald"
                  onclick="sidebarColor(this)"
                ></span>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-orange-500 to-yellow-500 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-white text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  data-color="orange"
                  onclick="sidebarColor(this)"
                ></span>
                <span
                  className="py-2.2 text-xs rounded-circle h-5.6 mr-1.25 w-5.6 ease-in-out bg-gradient-to-tl from-red-600 to-orange-600 relative inline-block cursor-pointer whitespace-nowrap border border-solid border-white text-center align-baseline font-bold uppercase leading-none text-white transition-all duration-200 hover:border-slate-700"
                  data-color="red"
                  onclick="sidebarColor(this)"
                ></span>
              </div>
            </a>
            <div className="mt-4">
              <h6 className="mb-0 dark:text-white">Sidenav Type</h6>
              <p className="text-sm leading-normal dark:text-white dark:opacity-80">
                Choose between 2 different sidenav types.
              </p>
            </div>
            <div className="flex">
              <button
                transparent-style-btn
                className="inline-block w-full px-4 py-2.5 mb-2 font-bold leading-normal text-center text-white capitalize align-middle transition-all bg-blue-500 border border-transparent border-solid rounded-lg cursor-pointer text-sm xl-max:cursor-not-allowed xl-max:opacity-65 xl-max:pointer-events-none xl-max:bg-gradient-to-tl xl-max:from-blue-500 xl-max:to-violet-500 xl-max:text-white xl-max:border-0 hover:-translate-y-px dark:cursor-not-allowed dark:opacity-65 dark:pointer-events-none dark:bg-gradient-to-tl dark:from-blue-500 dark:to-violet-500 dark:text-white dark:border-0 hover:shadow-xs active:opacity-85 ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 bg-gradient-to-tl from-blue-500 to-violet-500 hover:border-blue-500"
                data-class="bg-transparent"
                active-style
              >
                White
              </button>
              <button
                white-style-btn
                className="inline-block w-full px-4 py-2.5 mb-2 ml-2 font-bold leading-normal text-center text-blue-500 capitalize align-middle transition-all bg-transparent border border-blue-500 border-solid rounded-lg cursor-pointer text-sm xl-max:cursor-not-allowed xl-max:opacity-65 xl-max:pointer-events-none xl-max:bg-gradient-to-tl xl-max:from-blue-500 xl-max:to-violet-500 xl-max:text-white xl-max:border-0 hover:-translate-y-px dark:cursor-not-allowed dark:opacity-65 dark:pointer-events-none dark:bg-gradient-to-tl dark:from-blue-500 dark:to-violet-500 dark:text-white dark:border-0 hover:shadow-xs active:opacity-85 ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 bg-none hover:border-blue-500"
                data-class="bg-white"
              >
                Dark
              </button>
            </div>
            <p className="block mt-2 text-sm leading-normal dark:text-white dark:opacity-80 xl:hidden">
              You can change the sidenav type just on desktop view.
            </p>
            <div className="flex my-4">
              <h6 className="mb-0 dark:text-white">Navbar Fixed</h6>
              <div className="block pl-0 ml-auto min-h-6">
                <input
                  navbarFixed
                  className="rounded-10 duration-250 ease-in-out after:rounded-circle after:shadow-2xl after:duration-250 checked:after:translate-x-5.3 h-5 relative float-left mt-1 ml-auto w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-slate-800/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-blue-500/95 checked:bg-blue-500/95 checked:bg-none checked:bg-right"
                  type="checkbox"
                />
              </div>
            </div>
            <hr className="h-px my-6 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent " />
            <div className="flex mt-2 mb-12">
              <h6 className="mb-0 dark:text-white">Light / Dark</h6>
              <div className="block pl-0 ml-auto min-h-6">
                <input
                  dark-toggle
                  className="rounded-10 duration-250 ease-in-out after:rounded-circle after:shadow-2xl after:duration-250 checked:after:translate-x-5.3 h-5 relative float-left mt-1 ml-auto w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-slate-800/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-blue-500/95 checked:bg-blue-500/95 checked:bg-none checked:bg-right"
                  type="checkbox"
                />
              </div>
            </div>
            <a
              target="_blank"
              className="dark:border dark:border-solid dark:border-white inline-block w-full px-6 py-2.5 mb-4 font-bold leading-normal text-center text-white align-middle transition-all bg-transparent border border-solid border-transparent rounded-lg cursor-pointer text-sm ease-in hover:shadow-xs hover:-translate-y-px active:opacity-85 tracking-tight-rem shadow-md bg-150 bg-x-25 bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850"
              href="https://www.creative-tim.com/product/argon-dashboard-tailwind"
            >
              Free Download
            </a>
            <a
              target="_blank"
              className="dark:border dark:border-solid dark:border-white dark:text-white inline-block w-full px-6 py-2.5 mb-4 font-bold leading-normal text-center align-middle transition-all bg-transparent border border-solid rounded-lg shadow-none cursor-pointer active:shadow-xs hover:-translate-y-px active:opacity-85 text-sm ease-in tracking-tight-rem bg-150 bg-x-25 border-slate-700 text-slate-700 hover:bg-transparent hover:text-slate-700 hover:shadow-none active:bg-slate-700 active:text-white active:hover:bg-transparent active:hover:text-slate-700 active:hover:shadow-none"
              href="https://www.creative-tim.com/learning-lab/tailwind/html/quick-start/argon-dashboard/"
            >
              View documentation
            </a>
            <div className="w-full text-center">
              <a
                className="github-button"
                href="https://github.com/creativetimofficial/argon-dashboard-tailwind"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star creativetimofficial/argon-dashboard on GitHub"
              >
                Star
              </a>
              <h6 className="mt-4 dark:text-white">Thank you for sharing!</h6>
              <a
                href="https://twitter.com/intent/tweet?text=Check%20Argon%20Dashboard%20made%20by%20%40CreativeTim%20%23webdesign%20%23dashboard%20%23tailwindcss&amp;url=https%3A%2F%2Fwww.creative-tim.com%2Fproduct%2Fargon-dashboard-tailwind"
                class="inline-block px-5 py-2.5 mb-0 mr-2 font-bold text-center text-white align-middle transition-all border-0  rounded-lg cursor-pointer hover:shadow-xs hover:-translate-y-px active:opacity-85 leading-normal text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 me-2 border-slate-700 bg-slate-700"
                target="_blank"
              >
                {" "}
                <i class="mr-1 fab fa-twitter"></i> Tweet{" "}
              </a>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https://www.creative-tim.com/product/argon-dashboard-tailwind"
                class="inline-block px-5 py-2.5 mb-0 mr-2 font-bold text-center text-white align-middle transition-all border-0  rounded-lg cursor-pointer hover:shadow-xs hover:-translate-y-px active:opacity-85 leading-normal text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 me-2 border-slate-700 bg-slate-700"
                target="_blank"
              >
                {" "}
                <i class="mr-1 fab fa-facebook-square"></i> Share{" "}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
