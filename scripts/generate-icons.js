import { createCanvas } from 'canvas';
import fs from 'fs';

// Create icon (32x32)
function generateIcon() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, 32, 32);

    // Tree
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Draw tree trunk
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.lineTo(16, 12);
    ctx.stroke();

    // Draw branches (3 levels)
    const branches = [
        { y: 12, width: 6 },
        { y: 16, width: 4 },
        { y: 20, width: 3 }
    ];

    branches.forEach(({ y, width }) => {
        ctx.beginPath();
        ctx.moveTo(16 - width, y);
        ctx.lineTo(16 + width, y);
        ctx.stroke();

        // Add small circles at branch ends
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(16 - width, y, 1, 0, Math.PI * 2);
        ctx.arc(16 + width, y, 1, 0, Math.PI * 2);
        ctx.fill();
    });

    // Save icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./public/dsp-icon.png', buffer);
}

// Create preview image (1200x630)
function generatePreview() {
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(1, '#1976D2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Draw larger tree
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Tree trunk
    ctx.beginPath();
    ctx.moveTo(600, 500);
    ctx.lineTo(600, 200);
    ctx.stroke();

    // Branches
    const branches = [
        { y: 200, width: 150 },
        { y: 300, width: 100 },
        { y: 400, width: 50 }
    ];

    branches.forEach(({ y, width }) => {
        ctx.beginPath();
        ctx.moveTo(600 - width, y);
        ctx.lineTo(600 + width, y);
        ctx.stroke();

        // Branch endpoints
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(600 - width, y, 4, 0, Math.PI * 2);
        ctx.arc(600 + width, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DSP Family Trees', 600, 550);

    // Save preview
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./public/dsp-preview.png', buffer);
}

// Generate both images
generateIcon();
generatePreview(); 