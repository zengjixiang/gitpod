/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getCurrentTeam, TeamsContext } from "./teams-context";
import Modal from "../components/Modal";
import { ReactComponent as Spinner } from "../icons/Spinner.svg";
import { PaymentContext } from "../payment-context";
import { getGitpodService } from "../service/service";

export default function TeamUsageBasedBilling() {
    const { teams } = useContext(TeamsContext);
    const location = useLocation();
    const team = getCurrentTeam(location, teams);
    const { showUsageBasedUI } = useContext(PaymentContext);
    const [stripeCustomerId, setStripeCustomerId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showBillingSetupModal, setShowBillingSetupModal] = useState<boolean>(false);

    useEffect(() => {
        if (!team) {
            return;
        }
        (async () => {
            setStripeCustomerId(undefined);
            setIsLoading(true);
            try {
                const customerId = await getGitpodService().server.getTeamStripeCustomerId(team.id);
                setStripeCustomerId(customerId);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [team]);

    useEffect(() => {
        if (!team) {
            return;
        }
        const params = new URLSearchParams(location.search);
        if (!params.get("setup_intent") || params.get("redirect_status") !== "succeeded") {
            return;
        }
        (async () => {
            const setupIntentId = params.get("setup_intent")!;
            window.history.replaceState({}, "", window.location.pathname);
            await getGitpodService().server.subscribeTeamToStripe(team.id, setupIntentId);
        })();
    }, [location.search, team]);

    if (!showUsageBasedUI) {
        return <></>;
    }

    return (
        <div className="mb-16">
            <h3>Usage-Based Billing</h3>
            <h2 className="text-gray-500">Manage usage-based billing, spending limit, and payment method.</h2>
            <div className="max-w-2xl">
                <div className="mt-4 h-32 p-4 pt-6 pl-6 flex flex-col rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div className="uppercase text-sm text-gray-400 dark:text-gray-500">Billing</div>
                    {isLoading && (
                        <>
                            <Spinner className="m-2 h-5 w-5 animate-spin" />
                        </>
                    )}
                    {!isLoading && !stripeCustomerId && (
                        <>
                            <div className="text-xl font-semibold flex-grow text-gray-600 dark:text-gray-400">
                                Inactive
                            </div>
                            <button className="self-end" onClick={() => setShowBillingSetupModal(true)}>
                                Upgrade
                            </button>
                        </>
                    )}
                    {!isLoading && !!stripeCustomerId && (
                        <>
                            <div className="text-xl font-semibold flex-grow text-gray-600 dark:text-gray-400">
                                Active
                            </div>
                            <button className="self-end secondary" disabled={true}>
                                Manage →
                            </button>
                        </>
                    )}
                </div>
            </div>
            {showBillingSetupModal && <BillingSetupModal onClose={() => setShowBillingSetupModal(false)} />}
        </div>
    );
}

function BillingSetupModal(props: { onClose: () => void }) {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | undefined>();
    const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] = useState<string | undefined>();

    useEffect(() => {
        const { server } = getGitpodService();
        Promise.all([
            server.getStripePublishableKey().then((v) => () => setStripePromise(loadStripe(v || ""))),
            server.getStripeSetupIntentClientSecret().then((v) => () => setStripeSetupIntentClientSecret(v)),
        ]).then((setters) => setters.forEach((s) => s()));
    }, []);

    return (
        <Modal visible={true} onClose={props.onClose}>
            <h3 className="flex">Billing</h3>
            <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-2 h-96 -mx-6 px-6 flex flex-col">
                {!!stripePromise && !!stripeSetupIntentClientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret: stripeSetupIntentClientSecret }}>
                        <CreditCardInputForm />
                    </Elements>
                )}
            </div>
        </Modal>
    );
}

function CreditCardInputForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setIsLoading(true);
        try {
            const result = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
            });
            if (result.error) {
                // Show error to your customer (for example, payment details incomplete)
                throw result.error;
            } else {
                // Your customer will be redirected to your `return_url`. For some payment
                // methods like iDEAL, your customer will be redirected to an intermediate
                // site first to authorize the payment, then redirected to the `return_url`.
            }
        } catch (error) {
            console.error(error);
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="mt-4 flex-grow flex flex-col" onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="mt-4 flex-grow flex flex-col justify-end items-end">
                <button className="my-0 flex items-center space-x-2" disabled={!stripe || isLoading}>
                    <span>Submit</span>
                    {isLoading && <Spinner className="h-5 w-5 animate-spin filter brightness-150" />}
                </button>
            </div>
        </form>
    );
}
