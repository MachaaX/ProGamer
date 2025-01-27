// tracks.js

const Tracks = [
    {
        key: 'anilloMap',   // This should match the tilemap key you load (e.g. "anilloMap")
        name: 'Anillo',
        laps: 3,
        initX: 380,
        initY: 920
    },
    {
        key: 'jambaMap',
        name: 'Jamba',
        laps: 2,
        initX: 220,
        initY: 410
    },
    {
        key: 'lubaloccMap',
        name: 'Lubalocc',
        laps: 2,
        initX: 360,
        initY: 310
    }
];

// Make it global so other files can reference
window.Tracks = Tracks;
