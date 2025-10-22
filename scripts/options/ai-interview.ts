/** ------------------------------------------------------------------------
 * AI Interview Management
 * - Handles the AI-powered bio generation interview process
 * ------------------------------------------------------------------------ */

import { type DOMRefs } from "./dom-utils.js";
import { debugLog, debugError, debugWarn } from "./debug-utils.js";

const interviewQuestions = [
	"What's your current role and what do you do day-to-day?",
	"What are your key skills and areas of expertise?",
	"What's your biggest professional achievement you're proud of?",
	"What are your main interests or hobbies outside of work?",
	"How do you approach challenges or difficult problems?",
	"What motivates you or drives your passion?",
	"Describe a project or experience that shaped who you are today.",
	"What are your goals or what do you hope to accomplish?",
];

// Retry configuration for bio generation
const BIO_RETRY_CONFIG = {
	maxRetries: 2,
	retryDelay: 2000, // 2 seconds
};

// State
let currentQuestionIndex = 0;
let interviewAnswers: string[] = [];
let isInterviewActive = false;
let domRefs: DOMRefs;
let onBioGenerated: (bio: string) => void;

export function initAIInterview(
	refs: DOMRefs,
	bioCallback: (bio: string) => void
): void {
	domRefs = refs;
	onBioGenerated = bioCallback;
	bindEvents();
}

export function startInterview(): void {
	currentQuestionIndex = 0;
	interviewAnswers = [];
	isInterviewActive = true;

	const {
		aiInterviewContainer,
		manualBioContainer,
		bioPreviewContainer,
		interviewChat,
		interviewAnswer,
	} = domRefs;

	// Show interview container, hide others
	aiInterviewContainer.classList.remove("hidden");
	manualBioContainer.classList.add("hidden");
	bioPreviewContainer.classList.add("hidden");

	// Clear chat and start first question
	interviewChat.innerHTML = "";
	askNextQuestion();
	interviewAnswer.focus();
}

export async function regenerateBio(): Promise<string | null> {
	if (interviewAnswers.length === 0) return null;

	const { regenerateBioBtn } = domRefs;
	regenerateBioBtn.textContent = "Regenerating...";
	regenerateBioBtn.classList.add("loading");

	try {
		const newBio = await generateBioFromAnswers(interviewAnswers);
		return newBio;
	} catch (error) {
		console.error("Error regenerating bio:", error);
		return null;
	} finally {
		regenerateBioBtn.textContent = "Regenerate";
		regenerateBioBtn.classList.remove("loading");
	}
}

function askNextQuestion(): void {
	if (currentQuestionIndex >= interviewQuestions.length) {
		finishInterview();
		return;
	}

	const question = interviewQuestions[currentQuestionIndex];
	addChatMessage(question, "ai");
	updateProgress();
}

function addChatMessage(message: string, sender: "ai" | "user"): void {
	const { interviewChat } = domRefs;
	const messageDiv = document.createElement("div");
	messageDiv.className = `chat-message ${sender}`;
	messageDiv.textContent = message;
	interviewChat.appendChild(messageDiv);

	// Scroll to bottom
	interviewChat.scrollTop = interviewChat.scrollHeight;
}

function handleAnswerSubmit(): void {
	const { interviewAnswer } = domRefs;
	const answer = interviewAnswer.value.trim();
	if (!answer) return;

	// Add user's answer to chat
	addChatMessage(answer, "user");
	interviewAnswers.push(answer);

	// Clear input
	interviewAnswer.value = "";

	// Move to next question
	currentQuestionIndex++;

	// Small delay before next question for better UX
	setTimeout(() => {
		askNextQuestion();
	}, 500);
}

function updateProgress(): void {
	const { progressFill, progressText } = domRefs;
	const progress =
		((currentQuestionIndex + 1) / interviewQuestions.length) * 100;
	progressFill.style.width = `${progress}%`;
	progressText.textContent = `Question ${currentQuestionIndex + 1} of ${
		interviewQuestions.length
	}`;
}

async function finishInterview(): Promise<void> {
	const { sendAnswerBtn } = domRefs;
	isInterviewActive = false;

	// Show loading state
	sendAnswerBtn.textContent = "Generating bio...";
	sendAnswerBtn.classList.add("loading");

	try {
		console.log("🎯 Starting bio generation with retry mechanism...");
		// Generate bio using AI with retry mechanism
		const generatedBio = await generateBioFromAnswersWithRetry(
			interviewAnswers
		);
		console.log("🎉 Bio generation completed successfully!");
		onBioGenerated(generatedBio);
	} catch (error) {
		console.error("💥 Final error in finishInterview:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		const isConnectionError =
			errorMessage.includes("connection") ||
			errorMessage.includes("timeout") ||
			errorMessage.includes("offline") ||
			errorMessage.includes("network") ||
			errorMessage.includes("fetch");

		let userMessage = `Sorry, there was an error generating your bio: ${errorMessage}`;

		if (isConnectionError) {
			userMessage +=
				"\n\n🌐 This appears to be a connection issue. Please check your internet connection and try again.";
		} else if (errorMessage.includes("API") || errorMessage.includes("key")) {
			userMessage +=
				"\n\n🔑 This appears to be an API configuration issue. Please check the extension settings.";
		} else if (
			errorMessage.includes("Empty") ||
			errorMessage.includes("No content")
		) {
			userMessage +=
				"\n\n🤖 The AI service returned an empty response. Please try again.";
		}

		userMessage +=
			"\n\nYou can try again or write your bio manually using the 'Write Manually' button.";

		addChatMessage(userMessage, "ai");
	} finally {
		sendAnswerBtn.textContent = "Send";
		sendAnswerBtn.classList.remove("loading");
	}
}

async function generateBioFromAnswersWithRetry(
	answers: string[]
): Promise<string> {
	let lastError: Error = new Error("Unknown error occurred");

	for (let attempt = 0; attempt <= BIO_RETRY_CONFIG.maxRetries; attempt++) {
		try {
			return await generateBioFromAnswers(answers);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(
				`Bio generation attempt ${attempt + 1} failed:`,
				lastError.message
			);

			// Don't retry on the last attempt or for non-retryable errors
			if (
				attempt === BIO_RETRY_CONFIG.maxRetries ||
				(!lastError.message.includes("connection") &&
					!lastError.message.includes("timeout") &&
					!lastError.message.includes("offline"))
			) {
				break;
			}

			// Show retry message to user
			if (attempt < BIO_RETRY_CONFIG.maxRetries) {
				addChatMessage(
					`Connection issue detected. Retrying in ${
						BIO_RETRY_CONFIG.retryDelay / 1000
					} seconds... (Attempt ${attempt + 2}/${
						BIO_RETRY_CONFIG.maxRetries + 1
					})`,
					"ai"
				);
				await new Promise((resolve) =>
					setTimeout(resolve, BIO_RETRY_CONFIG.retryDelay)
				);
			}
		}
	}

	throw lastError;
}

async function generateBioFromAnswers(answers: string[]): Promise<string> {
	console.log("🔄 Starting bio generation process...");
	console.log("📝 Interview answers:", answers);

	// Create a structured prompt for the AI
	const prompt = `Based on these interview answers, create a comprehensive professional bio (2-3 paragraphs) that captures the person's background, skills, achievements, and personality:

${interviewQuestions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join("\n\n")}

Create a bio that:
- Sounds natural and engaging
- Highlights key professional strengths
- Includes personal interests/values
- Is suitable for job applications, networking, etc.
- Is 150-300 words

Bio:`;

	console.log(
		"📤 Sending prompt to background script:",
		prompt.substring(0, 200) + "..."
	);

	// Send to background script for AI processing
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		let hasResolved = false;

		// Set up a timeout to prevent hanging
		const timeoutId = setTimeout(() => {
			if (!hasResolved) {
				hasResolved = true;
				console.error("⏰ Frontend timeout after 65 seconds");
				reject(new Error("Request timed out on frontend"));
			}
		}, 65000); // 65 seconds (slightly longer than backend timeout)

		console.log("📤 Sending message to background script...");

		chrome.runtime.sendMessage(
			{
				type: "GENERATE_BIO",
				prompt: prompt,
			},
			(response) => {
				if (hasResolved) {
					console.warn("⚠️ Response received after timeout, ignoring");
					return;
				}

				const duration = Date.now() - startTime;
				console.log(`⏱️ Bio generation took ${duration}ms`);

				clearTimeout(timeoutId);
				hasResolved = true;

				if (chrome.runtime.lastError) {
					console.error("❌ Chrome runtime error:", chrome.runtime.lastError);
					reject(
						new Error(
							`Chrome runtime error: ${chrome.runtime.lastError.message}`
						)
					);
					return;
				}

				console.log("📥 Received response from background:", response);

				if (!response) {
					console.error("❌ No response received from background script");
					reject(new Error("No response received from background script"));
					return;
				}

				if (!response.success) {
					console.error("❌ Bio generation failed:", {
						error: response.error,
						userMessage: response.userMessage,
						isRetryable: response.isRetryable,
						debugInfo: response.debugInfo,
					});
					reject(
						new Error(
							response.userMessage || response.error || "Failed to generate bio"
						)
					);
					return;
				}

				if (!response.bio) {
					console.error("❌ No bio content in successful response");
					reject(new Error("No bio content received"));
					return;
				}

				console.log(
					"✅ Bio generated successfully:",
					response.bio.substring(0, 100) + "..."
				);
				resolve(response.bio);
			}
		);
	});
}

function bindEvents(): void {
	const { sendAnswerBtn, interviewAnswer } = domRefs;

	sendAnswerBtn.addEventListener("click", handleAnswerSubmit);

	// Handle Enter key in interview input
	interviewAnswer.addEventListener("keypress", (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAnswerSubmit();
		}
	});
}
