import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api2 from "../../store/api2"; // Sesuaikan path sesuai struktur project Anda
import axios from "axios";
import logoDark from "../../assets/img/logo-ct-dark.png";
import logoLight from "../../assets/img/logo-ct.png";
import team2 from "../../assets/img/team-2.jpg";
import logoSpotify from "../../assets/img/small-logos/logo-spotify.svg";
import "../../assets/css/argon-dashboard-tailwind.css";
import "../../assets/css/nucleo-svg.css";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { TvIcon } from "@heroicons/react/24/outline";

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    supplier_id: "",
    location_id: "",
    item_name: "",
    image: null,
    description: "",
    quantity: "",
    price: "",
    is_maintainable: 0,
    useful_life: "1",
    notes: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Fetch data untuk di-edit
  useEffect(() => {
    const fetchProcurement = async () => {
      try {
        setFetchLoading(true);
        const response = await api2.get(`/api/procurements/${id}`);
        const procurement = response.data.data;

        console.log("Full procurement data:", procurement);
        console.log("Procurement item data:", procurement.procurement_item);

        const procurementItem = procurement.procurement_item;

        setFormData({
          category_id:
            procurementItem?.category?.id || procurementItem?.category_id || "",
          supplier_id:
            procurementItem?.supplier?.id || procurementItem?.supplier_id || "",
          location_id:
            procurementItem?.location?.id || procurementItem?.location_id || "",
          item_name: procurementItem?.item_name || "",
          image: null, // Tetap null untuk file baru
          description: procurementItem?.description || "",
          quantity: procurementItem?.quantity || "",
          price: procurementItem?.price || "",
          is_maintainable: procurementItem?.is_maintainable || 0,
          useful_life: procurementItem?.useful_life || "1",
          notes: procurementItem?.notes || "",
        });

        console.log(formData);

        // Set current image URL jika ada
        if (procurementItem?.image) {
          setCurrentImage(
            `http://localhost:8000/storage/${procurementItem.image}`
          );
          setHasExistingImage(true);
        } else if (procurementItem?.image_url) {
          setCurrentImage(`http://localhost:8000/${procurementItem.image_url}`);
          setHasExistingImage(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        console.error("Error response:", err.response);
        setError("Failed to load procurement data");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProcurement();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file && file.size > 1024 * 1024) {
        setImageError("File size must be less than 1MB");
        setFormData((prev) => ({ ...prev, image: null }));
        e.target.value = "";
      } else {
        setImageError("");
        setFormData((prev) => ({ ...prev, [name]: file }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked ? 1 : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // await api2.get("/sanctum/csrf-cookie");

      if (
        !formData.category_id ||
        !formData.supplier_id ||
        !formData.location_id ||
        !formData.item_name ||
        !formData.quantity ||
        !formData.price
      ) {
        throw new Error("Please fill all required fields");
      }

      const submitData = new FormData();
      submitData.append("_method", "PUT");
      submitData.append("category_id", formData.category_id);
      submitData.append("supplier_id", formData.supplier_id);
      submitData.append("location_id", formData.location_id);
      submitData.append("item_name", formData.item_name);
      submitData.append("description", formData.description);
      submitData.append("quantity", formData.quantity);
      submitData.append("price", formData.price);
      submitData.append("is_maintainable", formData.is_maintainable);
      if (formData.is_maintainable && formData.useful_life !== null) {
        submitData.append("useful_life", formData.useful_life);
      }
      submitData.append("notes", formData.notes);

      // Hanya append image jika user memilih file baru
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Debug: Log FormData
      console.log("Submitting FormData:");
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api2.post(`/api/procurements/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update success:", response.data);
      setSuccess("Procurement item updated successfully!");
      setTimeout(() => {
        navigate("/procurements");
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      console.error("Error response:", err.response);

      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(", ");
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError("Validation failed. Please check your input.");
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to update procurement item."
        );
      }
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-wrap -mx-3">
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase dark:text-white dark:opacity-60">
                          Today's Money
                        </p>
                        <h5 className="mb-2 font-bold dark:text-white">
                          $53,000
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60">
                          <span className="text-sm font-bold leading-normal text-emerald-500">
                            +55%
                          </span>
                          since yesterday
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
                        <i className="ni leading-none ni-money-coins text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase dark:text-white dark:opacity-60">
                          Today's Users
                        </p>
                        <h5 className="mb-2 font-bold dark:text-white">
                          2,300
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60">
                          <span className="text-sm font-bold leading-normal text-emerald-500">
                            +3%
                          </span>
                          since last week
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-red-600 to-orange-600">
                        <i className="ni leading-none ni-world text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase dark:text-white dark:opacity-60">
                          New Clients
                        </p>
                        <h5 className="mb-2 font-bold dark:text-white">
                          +3,462
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60">
                          <span className="text-sm font-bold leading-normal text-red-600">
                            -2%
                          </span>
                          since last quarter
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400">
                        <i className="ni leading-none ni-paper-diploma text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase dark:text-white dark:opacity-60">
                          Sales
                        </p>
                        <h5 className="mb-2 font-bold dark:text-white">
                          $103,430
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60">
                          <span className="text-sm font-bold leading-normal text-emerald-500">
                            +5%
                          </span>
                          than last month
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-yellow-500">
                        <i className="ni leading-none ni-cart text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap mt-6 -mx-3">
            <div className="flex-none w-full max-w-full px-3">
              <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl rounded-2xl bg-clip-border">
                <div className="p-6 pb-0 mb-0 border-b-0 border-b-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="text-lg font-semibold">
                      Edit Procurement Item
                    </h6>
                    <Link
                      to="/procurements"
                      style={{
                        backgroundColor: "#6B7280",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        display: "inline-block",
                        textDecoration: "none",
                      }}
                    >
                      Back to List
                    </Link>
                  </div>
                </div>

                <div className="flex-auto p-6">
                  {error && (
                    <div
                      style={{
                        marginBottom: "1rem",
                        padding: "12px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        borderRadius: "8px",
                      }}
                    >
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  {success && (
                    <div
                      style={{
                        marginBottom: "1rem",
                        padding: "12px",
                        backgroundColor: "#F0FDF4",
                        border: "1px solid #BBF7D0",
                        color: "#16A34A",
                        borderRadius: "8px",
                      }}
                    >
                      <strong>Success:</strong> {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {/* Category ID */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Category ID *
                        </label>
                        <input
                          type="number"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          min="1"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Supplier ID */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Supplier ID *
                        </label>
                        <input
                          type="number"
                          name="supplier_id"
                          value={formData.supplier_id}
                          onChange={handleChange}
                          min="1"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Location ID */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Location ID *
                        </label>
                        <input
                          type="number"
                          name="location_id"
                          value={formData.location_id}
                          onChange={handleChange}
                          min="1"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Item Name */}
                      <div
                        style={{ marginBottom: "16px", gridColumn: "1 / -1" }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Item Name *
                        </label>
                        <input
                          type="text"
                          name="item_name"
                          value={formData.item_name}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Image Upload */}
                      <div
                        style={{ marginBottom: "16px", gridColumn: "1 / -1" }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          {currentImage ? "Change Image" : "Upload Image"} (Max
                          1MB)
                        </label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          onChange={handleChange}
                          accept="image/*"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                        />
                        {imageError && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#DC2626",
                              marginTop: "4px",
                            }}
                          >
                            {imageError}
                          </p>
                        )}

                        {/* Current Image Preview - Diletakkan di bawah input file */}
                        {currentImage &&
                          !(
                            formData.image && formData.image instanceof File
                          ) && (
                            <div style={{ marginTop: "12px" }}>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  color: "#374151",
                                  marginBottom: "8px",
                                }}
                              >
                                Current Image
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <img
                                  src={currentImage}
                                  alt="Current"
                                  style={{
                                    width: "120px",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "2px solid #3B82F6",
                                  }}
                                />
                              </div>
                            </div>
                          )}

                        {/* New Image Preview - Diletakkan di bawah current image */}
                        {formData.image && formData.image instanceof File && (
                          <div style={{ marginTop: "12px" }}>
                            <label
                              style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#374151",
                                marginBottom: "8px",
                              }}
                            >
                              New Image Preview
                            </label>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <img
                                src={URL.createObjectURL(formData.image)}
                                alt="Preview"
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "2px solid #10B981",
                                }}
                              />
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#6B7280",
                                    marginBottom: "4px",
                                  }}
                                >
                                  File: {formData.image.name}
                                </p>
                                <p
                                  style={{ fontSize: "12px", color: "#6B7280" }}
                                >
                                  Size:{" "}
                                  {(formData.image.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div
                        style={{ marginBottom: "16px", gridColumn: "1 / -1" }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="3"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                            resize: "vertical",
                          }}
                        />
                      </div>

                      {/* Quantity */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          min="1"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Price */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                          }}
                          required
                        />
                      </div>

                      {/* Is Maintainable */}
                      <div
                        style={{
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="is_maintainable"
                          checked={formData.is_maintainable === 1}
                          onChange={handleChange}
                          style={{
                            marginRight: "8px",
                            borderRadius: "4px",
                            border: "1px solid #D1D5DB",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          Is Maintainable
                        </span>
                      </div>

                      {/* Useful Life - Conditional */}
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Useful Life (years){" "}
                          {formData.is_maintainable === 1 && "*"}
                        </label>
                        <input
                          type="number"
                          name="useful_life"
                          value={formData.useful_life}
                          onChange={handleChange}
                          min="1"
                          disabled={formData.is_maintainable !== 1}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                            backgroundColor:
                              formData.is_maintainable !== 1
                                ? "#F3F4F6"
                                : "white",
                          }}
                          required={formData.is_maintainable === 1}
                        />
                      </div>

                      {/* Notes */}
                      <div
                        style={{ marginBottom: "16px", gridColumn: "1 / -1" }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="3"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            outline: "none",
                            fontSize: "14px",
                            resize: "vertical",
                          }}
                          placeholder="Additional notes or specifications..."
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "24px",
                      }}
                    >
                      <Link
                        to="/procurements"
                        style={{
                          backgroundColor: "#6B7280",
                          color: "white",
                          padding: "8px 24px",
                          borderRadius: "8px",
                          display: "inline-block",
                          textDecoration: "none",
                        }}
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#9CA3AF" : "#10B981",
                          color: "white",
                          padding: "8px 24px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "14px",
                        }}
                      >
                        {loading ? "Updating..." : "Update Item"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <footer className="pt-4">
            <div className="w-full px-6 mx-auto">
              <div className="flex flex-wrap items-center -mx-3 lg:justify-between">
                <div className="w-full max-w-full px-3 mt-0 mb-6 shrink-0 lg:mb-0 lg:w-1/2 lg:flex-none">
                  <div className="text-sm leading-normal text-center text-slate-500 lg:text-left">
                    ©
                    <script>
                      document.write(new Date().getFullYear() + ",");
                    </script>
                    made with <i className="fa fa-heart"></i> by
                    <a href="https://www.creative-tim.com" className="font-semibold text-slate-700 dark:text-white" target="_blank">Creative Tim</a>
                    for a better web.
                  </div>
                </div>
                <div className="w-full max-w-full px-3 mt-0 shrink-0 lg:w-1/2 lg:flex-none">
                  <ul className="flex flex-wrap justify-center pl-0 mb-0 list-none lg:justify-end">
                    <li className="nav-item">
                      <a href="https://www.creative-tim.com" className="block px-4 pt-0 pb-1 text-sm font-normal transition-colors ease-in-out text-slate-500" target="_blank">Creative Tim</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.creative-tim.com/presentation" className="block px-4 pt-0 pb-1 text-sm font-normal transition-colors ease-in-out text-slate-500" target="_blank">About Us</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://creative-tim.com/blog" className="block px-4 pt-0 pb-1 text-sm font-normal transition-colors ease-in-out text-slate-500" target="_blank">Blog</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.creative-tim.com/license" className="block px-4 pt-0 pb-1 pr-0 text-sm font-normal transition-colors ease-in-out text-slate-500" target="_blank">License</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </footer> */}
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

export default Update;
