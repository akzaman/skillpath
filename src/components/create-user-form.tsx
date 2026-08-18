import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Field, SelectField } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createManualUser, type Role } from "@/lib/roles";

function randomPassword(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
}

export function CreateUserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");

  const create = useMutation({
    mutationFn: () =>
      createManualUser({
        data: { name, email, password, role },
      }),
    onSuccess: async (person) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast(`Added ${person.name} as ${person.role}. They can log in with ${person.email}.`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("student");
    },
    onError: (error) => toast(error.message || "Could not add that person"),
  });

  return (
    <form
      className="rounded-md border border-line bg-surface p-5"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate();
      }}
    >
      <p className="text-xs font-bold tracking-wide text-muted uppercase">Add a person</p>
      <h2 className="mt-1 text-lg font-bold">Create a student or teacher</h2>
      <p className="mt-1 text-sm text-muted">
        They get an email-and-password account and can sign in immediately.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            placeholder="Jordan Lee"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="jordan@school.edu"
          />
        </Field>
        <Field label="Password">
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setPassword(randomPassword())}
            >
              Generate
            </Button>
          </div>
        </Field>
        <Field label="Role">
          <SelectField value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </SelectField>
        </Field>
      </div>
      <Button type="submit" className="mt-4" disabled={create.isPending}>
        {create.isPending ? "Adding…" : `Add ${role}`}
      </Button>
    </form>
  );
}
