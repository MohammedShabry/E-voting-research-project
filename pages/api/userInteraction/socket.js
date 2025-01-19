import { Server } from 'socket.io';

let io;
const userInteractionLogs = {}; // For tracking user interactions (optional)

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO...');
    io = new Server(res.socket.server, {
      path: '/api/userInteraction/socket',
      cors: {
        origin: '*', // Update this for production with specific trusted origins
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Listen for user interaction data
      socket.on('user_interaction', (data) => {
        console.log('Received interaction data:', data);

        // Log user interactions (optional)
        if (!userInteractionLogs[socket.id]) {
          userInteractionLogs[socket.id] = [];
        }
        userInteractionLogs[socket.id].push(data);

        // Analyze the interaction data and respond if necessary
        const response = analyzeUserInteraction(data);
        if (response.issueDetected) {
          socket.emit('help_response', response);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Optionally clear the interaction logs for the disconnected user
        delete userInteractionLogs[socket.id];
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO already initialized');
  }
  res.end();
}

// Analyze user interactions and provide feedback
function analyzeUserInteraction(data) {
  let response = { issueDetected: false };

  // Example: Long time spent on a task
  if (data.type === 'time_on_task' && data.timeSpent > 5000) { // 5 seconds as threshold
    response = {
      issueDetected: true,
      suggestion: 'It seems you are taking a while. Do you need assistance? Here is a guide to help you.',
    };
  }

  // Example: Repeated actions (e.g., multiple button clicks)
  if (data.type === 'repeated_actions' && data.count > 3) {
    response = {
      issueDetected: true,
      suggestion: 'You seem to be clicking repeatedly. Do you need help? Try following the instructions carefully.',
    };
  }

  // Example: Erratic scrolling
  if (data.type === 'erratic_scrolling' && data.scrollDifference > 200) {
    response = {
      issueDetected: true,
      suggestion: 'It looks like you might be struggling with scrolling. Would you like assistance? Here is a tutorial.',
    };
  }

  // Example: Form struggle (long time spent on form fields)
  if (data.type === 'form_struggle' && data.timeSpent > 5000) {
    response = {
      issueDetected: true,
      suggestion: `You’ve spent a long time on the ${data.fieldName} field. Do you need help? Here’s how to complete this form.`,
    };
  }

  // Example: Inactivity
  if (data.type === 'inactivity') {
    response = {
      issueDetected: true,
      suggestion: 'It seems like you’ve been inactive for a while. Do you need help continuing?',
    };
  }

  return response;
}
