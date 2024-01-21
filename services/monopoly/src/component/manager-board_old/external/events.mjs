export default async (v,p,c,obj,r) => {
    let worker = new Worker("/distrib/fs/worker_blobs.mjs");
    let blob = new Blob(['blob data']);
    worker.onmessage = msg => {
        console.log("[Main thread] Got message back:", msg.data);
    }
    worker.postMessage(blob);
    // let wmfs= await WMFS({
        // preInit() {},
        // onRuntimeInitialized() {
            // try {
                // isEmpty(window.FS)? window.FS = this.FS:window.FS 
                // const fsSetup = path => {
                    // this.FS.mkdir(path);
                    // this.FS.mount(this.FS.filesystems.IDBFS, {}, path);
                // };
                // fsSetup("/data");
            // } catch (e) {
                // console.error('error', e)
            // }
        // },
        // print: d => output.push(d),
    // })

}