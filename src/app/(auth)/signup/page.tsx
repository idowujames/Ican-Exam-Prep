"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Loader2 } from "lucide-react" // Import the Loader2 icon

export default function SignUp() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true) // Set loading to true when form is submitted
    setError("") // Clear any previous errors
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        setError(data.message || "An error occurred during registration")
      }
    } catch (error) {
      console.error(error)
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false) // Set loading back to false when the request is complete
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Create an account</h2>
          <p className="mt-2 text-sm text-text-secondary">Sign up to start your ICAN exam preparation</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                required 
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading} // Disable input when loading
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading} // Disable input when loading
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading} // Disable input when loading
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              'Sign up'
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}