const two = async () => {
    throw Error("two error");
}

const one = async () => {
    await two().catch(err => { console.log("one err:", err); throw err });
    console.log('after two');
}

const main = async () => {
    await Promise.all([Promise.resolve(1), one()]);
    console.log("after");
}

main().catch(console.error);