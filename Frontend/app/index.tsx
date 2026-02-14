import { Redirect } from "expo-router";
import { useAuth } from "./hooks/useAuth";
import { Loading } from "./components/ui/loading";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  return user ? (
    <Redirect href="/tabs/materi" />
  ) : (
    <Redirect href="/auth/login" />
  );
}
