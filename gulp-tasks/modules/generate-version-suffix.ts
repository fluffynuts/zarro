(function() {
    const { currentShortSHA } = requireModule<GitSha>("git-sha");
    const { timestamp } = requireModule<Timestamp>("timestamp");
    const options = {
      fullYear: false,
      includeSeconds: false
    } as TimestampOptions;

    module.exports = function generateVersionSuffix(): string {
        return `${timestamp(options)}.${currentShortSHA()}`
    }
})();
