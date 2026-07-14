import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <SignIn routing="path" path="/sign-in"
        appearance={{
          elements: {
            footerAction: { display: "none" },
          },
        }}/>
    </div>
  );
}
