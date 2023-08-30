(function() {
    module.exports = function containsAny<T>(
        array: T[],
        ...items: T[]
    ): boolean {
        // should be invoked with an args array followed by a list of things to look for
        if (!Array.isArray(array)) {
            array = [ array ]
        }

        if (items.length === 0) {
            return false;
        }

        return array.reduce(
            (acc, cur) => {
                if (acc) {
                    return acc;
                }
                if (cur === items[0]) {
                    return true;
                }
                return containsAny(items.slice(1), cur);
            },
            false
        );
    };
})();
