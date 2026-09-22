import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRecipesQuery } from "@/features/recipes/queries";
import { updateMyProfile } from "@/features/profile/api";
import { ToggleChipField } from "@/features/profile/components/ToggleChipField";
import { IngredientTagListField } from "@/features/profile/components/IngredientTagListField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ALLERGY_TYPES,
    COMMON_DISLIKED_INGREDIENTS,
    DIET_TAGS,
    type DietTag,
} from "@/types/models";

type Screen = "home" | "dietary" | "allergies" | "disliked" | "account";

/** Steps that count toward the "N/4" indicator, in order. */
const STEPS: Screen[] = ["dietary", "allergies", "disliked", "account"];

interface SignUpData {
    dietary_restrictions: DietTag[];
    allergies: string[];
    allergy_ingredients: string[];
    disliked_ingredients: string[];
    email: string;
    password: string;
}

export function SignUpFlow({
    onSuccess,
    onSwitchToLogin,
}: {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}) {
    const [screen, setScreen] = useState<Screen>("home");
    const [formData, setFormData] = useState<SignUpData>({
        dietary_restrictions: [],
        allergies: [],
        allergy_ingredients: [],
        disliked_ingredients: [],
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [recipes, setRecipes] = useState<Array<{ thumb_url: string | null }>>(
        [],
    );
    const { data: allRecipes } = useRecipesQuery();

    useEffect(() => {
        if (allRecipes && allRecipes.length > 0) {
            const systemRecipes = allRecipes.filter(
                (r) => r.source === "system" && r.thumb_url,
            );
            const shuffled = [...systemRecipes]
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
            setRecipes(shuffled);
        }
    }, [allRecipes]);

    const stepIndex = STEPS.indexOf(screen);

    function handleNext() {
        if (screen === "home") {
            setScreen("dietary");
            return;
        }
        const next = STEPS[stepIndex + 1];
        if (next) setScreen(next);
    }

    function handleBack() {
        if (stepIndex <= 0) {
            setScreen("home");
            return;
        }
        setScreen(STEPS[stepIndex - 1]);
    }

    function handleClose() {
        setScreen("home");
    }

    function getButtonText() {
        if (screen === "dietary")
            return formData.dietary_restrictions.length > 0 ? "Next" : "Skip";
        if (screen === "allergies")
            return formData.allergies.length > 0 ||
                formData.allergy_ingredients.length > 0
                ? "Next"
                : "Skip";
        if (screen === "disliked")
            return formData.disliked_ingredients.length > 0 ? "Next" : "Skip";
        return "Next";
    }

    async function handleCreateAccount() {
        setBusy(true);
        setError(null);
        try {
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });
            if (authError) {
                setError(authError.message);
                return;
            }
            if (!authData.user) {
                setError("Failed to create account");
                return;
            }

            // The on_auth_user_created trigger already inserted a blank profile row.
            await updateMyProfile(
                {
                    dietary_restrictions: formData.dietary_restrictions,
                    allergies: formData.allergies,
                    allergy_ingredients: formData.allergy_ingredients,
                    disliked_ingredients: formData.disliked_ingredients,
                },
                authData.user.id,
            );

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid min-h-svh w-full grid-cols-1 md:grid-cols-[5fr_7fr]">
            {/* Left panel */}
            <div
                key={`left-${screen}`}
                className="flex flex-col px-6 py-8 duration-300 animate-in fade-in md:px-16 md:py-10"
            >
                {screen === "home" ? (
                    <div className="flex flex-1 flex-col justify-center">
                        <div className="mx-auto w-full max-w-sm space-y-6">
                            <div>
                                <div className="flex items-center justify-center gap-3">
                                    <img
                                        src="/thyme-saver-logo.svg"
                                        alt=""
                                        className="h-8 w-auto md:h-10"
                                    />
                                    <span className="font-logo text-2xl font-semibold text-foreground md:text-4xl">
                                        Thyme Saver
                                    </span>
                                </div>
                                <p className="mt-4 text-center text-sm text-muted-foreground md:text-base">
                                    Get your weekly meal plans and discover new
                                    recipes
                                </p>
                            </div>
                            <Button onClick={handleNext} className="w-full">
                                Get Started
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="text-foreground hover:underline"
                                    onClick={onSwitchToLogin}
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-muted-foreground">
                                {stepIndex + 1}/{STEPS.length}
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col md:flex-row md:items-center">
                            <div className="mx-auto mt-8 w-full max-w-sm md:mt-0">
                                {screen === "dietary" && (
                                    <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
                                        Any dietary restrictions?
                                    </h2>
                                )}
                                {screen === "allergies" && (
                                    <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
                                        Any allergies?
                                    </h2>
                                )}
                                {screen === "disliked" && (
                                    <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
                                        Disliked ingredients?
                                    </h2>
                                )}
                                {screen === "account" && (
                                    <div className="space-y-6">
                                        <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
                                            Almost done
                                        </h2>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleCreateAccount();
                                            }}
                                            className="space-y-3"
                                        >
                                            <Input
                                                type="email"
                                                required
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                            />
                                            <Input
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        password:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                            {error && (
                                                <p className="text-sm text-destructive">
                                                    {error}
                                                </p>
                                            )}
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={busy}
                                            >
                                                {busy
                                                    ? "Creating account…"
                                                    : "Create Account"}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                                {screen !== "account" && (
                                    <div className="mt-8 hidden justify-center gap-3 md:flex">
                                        <Button
                                            variant="outline"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </Button>
                                        <Button onClick={handleNext}>
                                            {getButtonText()}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {screen !== "account" && (
                                <div className="mx-auto flex w-full max-w-sm flex-1 items-center justify-center md:hidden">
                                    {screen === "dietary" && (
                                        <ToggleChipField
                                            options={DIET_TAGS}
                                            value={formData.dietary_restrictions}
                                            onChange={(dietary_restrictions) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    dietary_restrictions,
                                                }))
                                            }
                                        />
                                    )}
                                    {screen === "allergies" && (
                                        <div className="w-full space-y-4">
                                            <ToggleChipField
                                                options={ALLERGY_TYPES}
                                                value={formData.allergies}
                                                onChange={(allergies) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        allergies,
                                                    }))
                                                }
                                            />
                                            <IngredientTagListField
                                                value={
                                                    formData.allergy_ingredients
                                                }
                                                onChange={(
                                                    allergy_ingredients,
                                                ) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        allergy_ingredients,
                                                    }))
                                                }
                                                placeholder="Add an ingredient…"
                                            />
                                        </div>
                                    )}
                                    {screen === "disliked" && (
                                        <IngredientTagListField
                                            value={
                                                formData.disliked_ingredients
                                            }
                                            onChange={(
                                                disliked_ingredients,
                                            ) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    disliked_ingredients,
                                                }))
                                            }
                                            placeholder="Add a disliked ingredient…"
                                            suggestions={
                                                COMMON_DISLIKED_INGREDIENTS
                                            }
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {screen !== "account" && (
                            <div className="flex justify-center gap-3 md:hidden">
                                <Button variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button onClick={handleNext}>
                                    {getButtonText()}
                                </Button>
                            </div>
                        )}
                        {screen === "account" && (
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Right panel */}
            <div
                key={`right-${screen}`}
                className="hidden overflow-hidden bg-card duration-300 animate-in fade-in md:flex md:items-center md:justify-center md:p-10"
            >
                {(screen === "home" || screen === "account") &&
                    recipes.length > 0 && (
                        <div className="grid w-full max-w-md grid-cols-2 gap-4">
                            {recipes.map((recipe, i) => (
                                <div
                                    key={i}
                                    className="aspect-square overflow-hidden rounded-lg bg-muted"
                                >
                                    {recipe.thumb_url && (
                                        <img
                                            src={recipe.thumb_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                {screen === "dietary" && (
                    <div className="max-w-lg">
                        <ToggleChipField
                            options={DIET_TAGS}
                            value={formData.dietary_restrictions}
                            onChange={(dietary_restrictions) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    dietary_restrictions,
                                }))
                            }
                        />
                    </div>
                )}

                {screen === "allergies" && (
                    <div className="w-full max-w-md space-y-4">
                        <ToggleChipField
                            options={ALLERGY_TYPES}
                            value={formData.allergies}
                            onChange={(allergies) =>
                                setFormData((prev) => ({ ...prev, allergies }))
                            }
                        />
                        <IngredientTagListField
                            value={formData.allergy_ingredients}
                            onChange={(allergy_ingredients) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    allergy_ingredients,
                                }))
                            }
                            placeholder="Add an ingredient…"
                        />
                    </div>
                )}

                {screen === "disliked" && (
                    <div className="w-full max-w-md">
                        <IngredientTagListField
                            value={formData.disliked_ingredients}
                            onChange={(disliked_ingredients) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    disliked_ingredients,
                                }))
                            }
                            placeholder="Add a disliked ingredient…"
                            suggestions={COMMON_DISLIKED_INGREDIENTS}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
