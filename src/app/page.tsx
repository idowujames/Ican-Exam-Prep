import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <nav className="container mx-auto flex justify-between items-center">
          <Image
            src="/placeholder.svg?height=40&width=120"
            alt="ICAN Exam Prep Logo"
            width={120}
            height={40}
            priority
          />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to ICAN Exam Prep Companion</h1>
          <p className="text-xl mb-8">Your path to success in ICAN examinations starts here.</p>
          <Button asChild size="lg">
            <Link href="/login">Login to Get Started</Link>
          </Button>
        </div>
      </main>
      <footer className="p-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ICAN Exam Prep Companion. All rights reserved.
        </div>
      </footer>
    </div>
  )
}