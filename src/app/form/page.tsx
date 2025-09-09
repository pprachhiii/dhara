// "use client";

// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";

// type ModelType = "Task" | "Drive" | "Authority";

// function FormContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const queryModel = (searchParams.get("model") as ModelType) || "Report";

//   const [model, setModel] = useState<ModelType>(queryModel);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Check user login and set userId
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch("/api/auth/me", { credentials: "include" });
//         if (!res.ok) {
//           toast.error("You must be logged in to submit a report");
//           router.push("/auth/login");
//           return;
//         }

//         const data = await res.json();
//         setUserId(data.user.id); // set actual logged-in user id
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         toast.error("Session expired, please login again.");
//         router.push("/auth/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [router]);


//   // Sync model with URL query param
//   useEffect(() => {
//     const urlModel = (searchParams.get("model") as ModelType) || "Report";
//     setModel(urlModel);
//   }, [searchParams]);

//   if (loading) return <div>Loading...</div>;

// }

// export default function FormPage() {
//   return (
//     <Suspense fallback={<div>Loading form...</div>}>
//       <FormContent />
//     </Suspense>
//   );
// }
