using System;
using System.Collections.Generic;
using System.Threading;
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

    [Test]
    public void ShouldBeSlow()
    {
        // Arrange
        // Act
        Thread.Sleep(2000);
        // Assert
        Assert.Pass("slow, but steady");
    }

    [Test]
    [Ignore("skipped - always fails!")]
    public void ShouldBeSkipped()
    {
        // Arrange
        // Act
        // Assert
        Assert.That(1, Is.EqualTo(2));
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