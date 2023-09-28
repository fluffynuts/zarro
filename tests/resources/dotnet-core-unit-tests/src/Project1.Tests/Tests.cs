using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Project1.Tests;

[TestFixture]
public class Tests
{
    [Test]
    public void ShouldPass()
    {
        // Arrange
        // Act
        Assert.Pass("Winner");
        // Assert
    }

    [Test]
    public void ShouldFailWhenForced()
    {
        // Arrange
        // Act
        if (EnvironmentFlag("FORCE_TEST_FAILURE", false))
        {
            Assert.Fail("Test failure requested");
        }
        else
        {
            Assert.Pass("Happy days");
        }
        // Assert
    }

    private bool EnvironmentFlag(string name, bool fallback)
    {
        var env = Environment.GetEnvironmentVariable(name);
        if (env is null)
        {
            return fallback;
        }
        return PositiveFlags.Contains(env);
    }

    private static readonly HashSet<string> PositiveFlags = new(
        new[]
        {
            "1",
            "true"
        },
        StringComparer.OrdinalIgnoreCase
    );
}