import express from "express";
import { createSubscription, getSubscription, cancelSubscription } from "../services/paypal.js";
import { supabase } from "../services/supabase.js";

const router = express.Router();

// Create subscription link
router.post("/create-subscription", async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Plan ID are required"
      });
    }

    // Create PayPal subscription
    const subscription = await createSubscription(planId);

    if (!subscription.id) {
      return res.status(400).json({
        success: false,
        message: "Failed to create PayPal subscription"
      });
    }

    // Store subscription record in Supabase
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        paypal_subscription_id: subscription.id,
        plan_id: planId,
        status: "pending",
        created_at: new Date().toISOString()
      });

    if (insertError) {
      return res.status(400).json({
        success: false,
        error: insertError.message
      });
    }

    res.json({
      success: true,
      subscription_id: subscription.id,
      approval_link: subscription.links.find(link => link.rel === "approve")?.href
    });

  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get subscription status
router.get("/subscription/:subscriptionId", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required"
      });
    }

    // Get from PayPal
    const subscription = await getSubscription(subscriptionId);

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan_id: subscription.plan_id,
        subscriber: subscription.subscriber,
        start_time: subscription.start_time,
        next_billing_time: subscription.next_billing_time
      }
    });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Cancel subscription
router.post("/cancel-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required"
      });
    }

    // Cancel on PayPal
    await cancelSubscription(subscriptionId);

    // Update status in Supabase
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("paypal_subscription_id", subscriptionId);

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: "Subscription cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Verify user subscription (for premium content access)
router.get("/verify/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get active subscription from Supabase
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const hasActiveSubscription = data && data.length > 0;

    res.json({
      success: true,
      is_subscribed: hasActiveSubscription,
      subscription: hasActiveSubscription ? data[0] : null
    });

  } catch (error) {
    console.error("Error verifying subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Webhook handler for PayPal events
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;

    console.log("PayPal Webhook Event:", event.event_type);

    // Handle subscription activated
    if (event.event_type === "BILLING.SUBSCRIPTION.CREATED") {
      const subscriptionId = event.resource.id;

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "active", activated_at: new Date().toISOString() })
        .eq("paypal_subscription_id", subscriptionId);

      if (error) {
        console.error("Error updating subscription:", error);
      }
    }

    // Handle subscription payment completed
    if (event.event_type === "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED") {
      const subscriptionId = event.resource.id;
      const amount = event.resource.amount_paid?.value;

      const { error } = await supabase
        .from("payments")
        .insert({
          paypal_subscription_id: subscriptionId,
          amount: amount,
          transaction_id: event.resource.id,
          event_type: "payment_completed",
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error recording payment:", error);
      }
    }

    // Handle subscription cancelled
    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = event.resource.id;

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("paypal_subscription_id", subscriptionId);

      if (error) {
        console.error("Error cancelling subscription:", error);
      }
    }

    // Always respond with 200 to acknowledge receipt
    res.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent PayPal retries
    res.status(200).json({ success: true });
  }
});


export default router;
