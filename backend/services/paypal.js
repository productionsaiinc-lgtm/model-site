import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config();

const environment =
  process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

export const paypalClient = new paypal.core.PayPalHttpClient(
  environment
);

export async function createSubscription(planId) {
  const request = new paypal.subscriptions.SubscriptionsCreateRequest();

  request.requestBody({
    plan_id: planId,
    application_context: {
      brand_name: "Nova Studio",
      user_action: "SUBSCRIBE",
      return_url:
        `${process.env.FRONTEND_URL}/account.html?payment=success`,
      cancel_url:
        `${process.env.FRONTEND_URL}/pricing.html?payment=cancelled`
    }
  });

  const response = await paypalClient.execute(request);

  return response.result;
}

export async function getSubscription(subscriptionId) {
  const request =
    new paypal.subscriptions.SubscriptionsGetRequest(
      subscriptionId
    );

  const response = await paypalClient.execute(request);

  return response.result;
}

export async function cancelSubscription(subscriptionId) {
  const request =
    new paypal.subscriptions.SubscriptionsCancelRequest(
      subscriptionId
    );

  request.requestBody({
    reason: "User requested cancellation"
  });

  const response = await paypalClient.execute(request);

  return response.result;
}