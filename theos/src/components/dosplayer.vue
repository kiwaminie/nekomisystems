<script setup>
    import { onBeforeUnmount, onMounted } from 'vue'

    const props = defineProps([
        'zipPath', 
        'executable'
    ]);

    let dosInstance = null;

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            if (window.Dosbox || window.Dos) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    onMounted(async () => {
        try {
            await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
            await loadScript("https://js-dos.com/cdn/js-dos-api.js");

            dosInstance = new Dosbox({
                id: "dosbox-master",
                onload: (db) => {
                    db.run(props.zipPath, props.executable);
                },
                onrun: (db, app) => {
                    console.log("App '" + app + "' is running");
                }
            });
        } catch (err) {
            console.error("Error cargando JS-DOS:", err);
        }
    });

    onBeforeUnmount(() => {
        if (dosInstance) {
            if (typeof dosInstance.stop === 'function') {
                dosInstance.stop();
            }
            
            const container = document.getElementById("dosbox-master");
            
            if (container) {
                container.innerHTML = "";
            }

            dosInstance = null;
        }
    })

    /*onMounted(() => {
        const script3 = document.createElement('script')
        script3.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
        document.head.appendChild(script3)

        const script1 = document.createElement('script')
        script1.src = '/games/doom/js-dos-v3.js'
        document.head.appendChild(script1)    

        const script = document.createElement('script')
        script.src = '/games/doom/js-dos-api.js'
        document.head.appendChild(script)

        setTimeout(function () {
        var dosbox_DOOM = new Dosbox({
                id: "dosbox-master",
                onload: function (dosbox) {
                dosbox_DOOM.run("/games/doom/doom_asset.zip", "./DOOM/DOOM.EXE");
                },
                onrun: function (dosbox, app) {
                console.log("App '" + app + "' is runned");
                }
            });
        }, 1000)
    })*/
</script>

<style>
    #dosbox-master {
        width: 100%; 
        height: 100%;
        display: block !important;
        visibility: visible !important;
    }

    .dosbox-start{
        color: blue !important;
    }

    .dosbox-start::after{
        content: "Iniciar" !important;
    }

    .dosbox-overlay{
        display: flex;
        background-color: unset !important;
    }

    .dosbox-container{
        width: 100% !important;
        height: 100% !important;
    }
</style>

<template>
    <div id="dosbox-master"></div>
</template>