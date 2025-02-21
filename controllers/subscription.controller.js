import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};


// import Subscription from "../models/subscription.model.js";
// import { workflowClient } from "../config/upstash.js";
// import { SERVER_URL } from "../config/env.js";

// export const createSubscription = async (req, res, next) => {
//   try {
//     const subscription = await Subscription.create({
//       ...req.body,
//       user: req.user._id,
//     });

//     // Max allowed delay (10 days in milliseconds)
//     const maxAllowedDelay = 10 * 24 * 60 * 60 * 1000;
    
//     // Calculate reminder time (7 days before renewalDate)
//     const reminderTime = new Date(subscription.renewalDate);
//     reminderTime.setDate(reminderTime.getDate() - 7);
    
//     let delay = reminderTime.getTime() - Date.now();
    
//     // Ensure delay does not exceed maxAllowedDelay
//     if (delay > maxAllowedDelay) {
//       delay = maxAllowedDelay;
//     }

//     const { workflowRunId } = await workflowClient.trigger({
//       url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
//       body: {
//         subscriptionId: subscription.id,
//       },
//       headers: {
//         "content-type": "application/json",
//       },
//       retries: 0,
//       delay: delay / 1000, // Convert milliseconds to seconds
//     });

//     res.status(201).json({ success: true, data: { subscription, workflowRunId } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getUserSubscriptions = async (req, res, next) => {
//   try {
//     // Check if the user is the same as the one in the token
//     if (req.user.id !== req.params.id) {
//       const error = new Error("You are not the owner of this account");
//       error.status = 401;
//       throw error;
//     }

//     const subscriptions = await Subscription.find({ user: req.params.id });

//     res.status(200).json({ success: true, data: subscriptions });
//   } catch (e) {
//     next(e);
//   }
// };
