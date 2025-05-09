"use client";
import { auth, provider } from "@/app/firebase/config";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FacebookAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";

export default function SignUp() {
  const [show, setShow] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [checkBox, setCheckBox] = useState(false);

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const db = getFirestore();

  const handleSignUp = async () => {
    const regex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Basic Validation
    if (!fName || !lName || !email || !password || !confirmPassword) {
      alert("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    if (!regex.test(password)) {
      alert(
        "Password must contain at least one special character and one number"
      );
      setIsSubmitting(false);
      return;
    }

    if (!checkBox) {
      alert("Please accept the terms and conditions");
      setIsSubmitting(false);
      return;
    }

    try {
      const usersQuery = query(
        collection(db, "Users"),
        where("User_Email", "==", email)
      );
      const pendingQuery = query(
        collection(db, "pending_users"),
        where("User_Email", "==", email)
      );

      const [usersSnapshot, pendingSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(pendingQuery),
      ]);

      if (!usersSnapshot.empty || !pendingSnapshot.empty) {
        alert("This email is already registered or pending approval");
        setIsSubmitting(false);
        return;
      }

      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(email, password);
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      const pendingUserRef = doc(db, "pending_users", res.user.uid);
      await setDoc(pendingUserRef, {
        User_Name: `${fName} ${lName}`,
        User_Email: email,
        User_UID: res.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
        status: "pending",
      });

      // Sign out the user immediately after creation
      await signOut(auth);

      // Clear input fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFName("");
      setLName("");

      // Redirect to pending approval page
      router.push("/pending-approval");
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert(
        `Sign-up failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleAuth = async () => {
    try {
      if (!checkBox) {
        alert("Please accept the Terms and Conditions");
        return;
      }

      const result = await signInWithPopup(auth, provider);

      // Check if user is already approved
      const userDoc = await getDoc(doc(db, "Users", result.user.uid));

      if (!userDoc.exists()) {
        // Add to pending_users if not approved yet
        await setDoc(doc(db, "pending_users", result.user.uid), {
          User_Name: result.user.displayName,
          User_Email: result.user.email,
          User_UID: result.user.uid,
          CreatedAt: Timestamp.now(),
          TermsAndConditions: checkBox,
          status: "pending",
        });

        // Sign out and show pending message
        await signOut(auth);
        router.push("/pending-approval");
        return;
      }

      // If already approved, proceed to dashboard
      router.push("/");
    } catch (error) {
      console.error("Google auth error:", error);
      alert("Google sign-in failed. Please try again.");
    }
  };

  const facebookAuth = async () => {
    try {
      if (!checkBox) {
        alert("Please accept the Terms and Conditions");
        return;
      }

      const result = await signInWithPopup(auth, new FacebookAuthProvider());

      // Check if user is already approved
      const userDoc = await getDoc(doc(db, "Users", result.user.uid));

      if (!userDoc.exists()) {
        // Add to pending_users if not approved yet
        await setDoc(doc(db, "pending_users", result.user.uid), {
          User_Name: result.user.displayName,
          User_Email: result.user.email,
          User_UID: result.user.uid,
          CreatedAt: Timestamp.now(),
          TermsAndConditions: checkBox,
          status: "pending",
        });

        // Sign out and show pending message
        await signOut(auth);
        router.push("/pending-approval");
        return;
      }

      router.push("/");
    } catch (error) {
      console.error("Facebook auth error:", error);
      alert("Facebook sign-in failed. Please try again.");
    }
  };

  console.log("Value of Checkbox: ", checkBox);

  return (
    <>
      <div className="xl:h-full 2xl:h-screen bg-signUp flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-20 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div className="w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7">
          <div className="mt-14 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/PawPrint.svg"
                height={50}
                width={50}
                alt="Paw Print Icon"
              />
              <h1 className="text-3xl font-montserrat font-bold">Register</h1>
            </div>
            <RegisterAs />
          </div>
          <form
            className="flex flex-col gap-7 z-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="grid grid-cols-2 gap-10">
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="fName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                />
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="emailsignup"
                className="absolute left-7 -top-2 bg-white text-sm  font-hind"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="emailsignup"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="absolute left-7 -top-2 bg-white text-sm  font-hind"
              >
                Password
              </label>
              <input
                type={show ? `text` : `password`}
                name="password"
                id="password"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                value={password}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-3 bottom-4">
                <Image
                  src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                  height={33.53}
                  width={19}
                  alt="Show Password icon"
                  className="object-contain cursor-pointer"
                  draggable={false}
                  onClick={() => setShow((prev) => !prev)}
                />
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="absolute left-7 -top-2 bg-white text-sm font-hind"
              >
                Confirm Password
              </label>
              <input
                type={confirmShow ? `text` : `password`}
                name="confirm password"
                id="confirmPassword"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="absolute right-3 bottom-4">
                <Image
                  src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                  height={33.53}
                  width={19}
                  alt="Show Password icon"
                  draggable={false}
                  className="object-contain cursor-pointer"
                  onClick={() => setConfirmShow((prev) => !prev)}
                />
              </div>
            </div>
            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2"
                checked={checkBox}
                onChange={() => setCheckBox((prev) => !prev)}
              />
              <p>
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
              </p>
            </div>
            <div>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>
          <div>
            <p>
              Already have an account?{" "}
              <span className="text-base font-hind text-[#4ABEC5]">
                <Link href="/Login">Log in here</Link>
              </span>
            </p>
          </div>
          <div className="w-[600px] h-20 grid grid-cols-3 gap-4">
            <div
              className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
              onClick={googleAuth}
            >
              <GoogleOutlined className="text-4xl text-green-500" />
              <h1 className="text-2xl font-hind">Google</h1>
            </div>
            <div
              className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
              onClick={facebookAuth}
            >
              <FacebookOutlined className="text-4xl text-blue-500" />
              <h1 className="text-2xl font-hind">Facebook</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBowlRice,
  faChevronDown,
  faDove,
  faHandHoldingMedical,
  faHandshakeSimple,
  faHouseUser,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";

function RegisterAs() {
  const [signUpAs, setSignUpAs] = useState(false);

  const registerAsData = [
    {
      key: 0,
      label: "Pet Owner",
      icon: faPaw,
      route: "/Sign-Up",
    },
    {
      key: 1,
      label: "Pet Product Seller",
      icon: faHandshakeSimple,
      route: "https://seller-pet-care-pro.vercel.app/Sign-Up-Seller",
    },
    {
      key: 2,
      label: "Pet Veterinarian",
      icon: faHandHoldingMedical,
      route: "https://doctor-pet-care-pro.vercel.app",
    },
    {
      key: 3,
      label: "Pet Sitting Services",
      icon: faBowlRice,
      route: "/Sitter",
    },
    {
      key: 4,
      label: "Pet Memorial",
      icon: faDove,
      route: "https://memorial-pet-care-pro.vercel.app/Sign-Up-Memorial",
    },

    {
      key: 5,
      label: "Pet Boarding Services",
      icon: faHouseUser,
      route: "https://boarding-pet-care-pro.vercel.app/Sign-Up-Boarding",
    },
  ];
  return (
    <div>
      <div className="relative z-20 border-2 cursor-pointer font-medium font-montserrat border-gray-300 rounded-lg drop-shadow-md w-fit gap-2 text-center h-10 flex items-center ">
        <div
          onClick={() => setSignUpAs((prev) => !prev)}
          className=" w-full gap-2 text-center h-10 flex items-center px-2"
        >
          Register As?
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
      <Modal
        open={signUpAs}
        centered
        onClose={() => setSignUpAs(false)}
        onCancel={() => setSignUpAs(false)}
      >
        <div className="grid grid-cols-3 gap-5 m-5">
          {registerAsData.map((data) => (
            <Link
              href={data.route}
              key={data.key}
              className="font-hind font-medium h-24 cursor-pointer text-center hover:text-white"
              onClick={() => setSignUpAs(false)}
            >
              <div className=" border-2 hover:bg-[#006B95] font-montserrat font-bold text-[#466571] rounded-md border-[#006B95] hover:text-white h-full flex flex-col items-center justify-center">
                <FontAwesomeIcon
                  icon={data?.icon}
                  className={`text-2xl text-[#ADD8E6]`}
                />

                {data?.label}
              </div>
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
}
